import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  createPublicClient,
  decodeEventLog,
  http,
  isAddress,
  isHash,
  parseAbiItem,
  parseUnits,
  type Address,
  type Hash,
} from 'viem';
import { defineChain } from 'viem';
import type { X402PaymentRequired, X402PaymentSignature, X402PaymentResponse } from './types.js';

const ARC_TESTNET_ID = 5042002;
const ARC_TESTNET_NETWORK = `eip155:${ARC_TESTNET_ID}`;
const arcTestnet = defineChain({
  id: ARC_TESTNET_ID,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.io'] } },
  blockExplorers: { default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' } },
  testnet: true,
});

const directPaymentExecuted = parseAbiItem(
  'event DirectPaymentExecuted(address indexed agentKey,address indexed token,address indexed recipient,uint256 amount,uint256 fee)',
);

export interface X402PaywallConfig {
  costUsdc: string;
  recipient: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  rpcUrl?: string;
  description?: string;
}

/** Arc Testnet x402 paywall. Verifies the Paythos vault event, payer, token, recipient and amount. */
export function createX402Paywall(config: X402PaywallConfig) {
  if (![config.recipient, config.tokenAddress, config.vaultAddress].every((address) => isAddress(address))) {
    throw new Error('Paythos x402 requires valid Arc Testnet recipient, token, and vault addresses.');
  }

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(config.rpcUrl || arcTestnet.rpcUrls.default.http[0]),
  });
  const network = ARC_TESTNET_NETWORK;
  const rawAmount = parseUnits(config.costUsdc, 6).toString();
  const usedPaymentTransactions = new Set<Hash>();

  return async function handleX402(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    const paymentSignatureHeaderValue = req.headers['payment-signature'];
    const paymentSignatureHeader = typeof paymentSignatureHeaderValue === 'string'
      ? paymentSignatureHeaderValue
      : undefined;
    if (paymentSignatureHeaderValue !== undefined && paymentSignatureHeader === undefined) {
      res.statusCode = 403;
      res.end(JSON.stringify({ error: 'Payment was not verified for this Paythos resource.' }));
      return;
    }

    if (!paymentSignatureHeader) {
      const requirements: X402PaymentRequired = {
        x402Version: 2,
        resource: {
          url: req.url,
          description: config.description || 'Protected Paythos resource',
        },
        accepts: [{
          scheme: 'exact',
          network,
          amount: rawAmount,
          asset: config.tokenAddress,
          payTo: config.recipient,
          maxTimeoutSeconds: 60,
          extra: { symbol: 'USDC', decimals: 6 },
        }],
      };
      const encoded = Buffer.from(JSON.stringify(requirements)).toString('base64');
      res.statusCode = 402;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('PAYMENT-REQUIRED', encoded);
      res.end(JSON.stringify(requirements, null, 2));
      return;
    }

    let reservedHash: Hash | undefined;
    try {
      const decoded = Buffer.from(paymentSignatureHeader, 'base64').toString('utf8');
      const payload = JSON.parse(decoded) as Partial<X402PaymentSignature>;
      if (
        payload.x402Version !== 2 ||
        payload.scheme !== 'exact' ||
        payload.network !== network ||
        !payload.payload ||
        !isHash(payload.payload.txHash) ||
        !isAddress(payload.payload.payer) ||
        payload.payload.amount !== rawAmount
      ) {
        throw new Error('Payment signature does not match the Arc Testnet payment requirement.');
      }

      const chainId = await publicClient.getChainId();
      if (chainId !== ARC_TESTNET_ID) throw new Error(`Expected Arc Testnet; RPC returned chain ${chainId}.`);

      if (usedPaymentTransactions.has(payload.payload.txHash)) {
        throw new Error('This payment transaction has already been accepted.');
      }
      usedPaymentTransactions.add(payload.payload.txHash);
      reservedHash = payload.payload.txHash;
      const receipt = await publicClient.getTransactionReceipt({ hash: payload.payload.txHash });
      if (receipt.status !== 'success' || receipt.to?.toLowerCase() !== config.vaultAddress.toLowerCase()) {
        throw new Error('Payment transaction did not successfully call the configured Paythos vault.');
      }

      const matchingPayment = receipt.logs.some((log) => {
        if (log.address.toLowerCase() !== config.vaultAddress.toLowerCase()) return false;
        try {
          const decodedLog = decodeEventLog({
            abi: [directPaymentExecuted],
            data: log.data,
            topics: log.topics,
          });
          const args = decodedLog.args;
          return args.agentKey.toLowerCase() === payload.payload!.payer.toLowerCase()
            && args.token.toLowerCase() === config.tokenAddress.toLowerCase()
            && args.recipient.toLowerCase() === config.recipient.toLowerCase()
            && args.amount + args.fee === BigInt(rawAmount);
        } catch {
          return false;
        }
      });
      if (!matchingPayment) throw new Error('Paythos vault receipt has no matching payment event.');

      const confirmation: X402PaymentResponse = {
        success: true,
        txHash: payload.payload.txHash as Hash,
        network,
      };
      res.setHeader('PAYMENT-RESPONSE', Buffer.from(JSON.stringify(confirmation)).toString('base64'));
    } catch {
      if (reservedHash) usedPaymentTransactions.delete(reservedHash);
      res.statusCode = 403;
      res.end(JSON.stringify({ error: 'Payment was not verified for this Paythos resource.' }));
      return;
    }
    next();
  };
}
