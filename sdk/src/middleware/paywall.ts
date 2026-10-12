import { verifyTypedData, Address } from 'viem';
import {
  SignedPaymentVoucher,
  PAYTHOS_EIP712_TYPES,
  getEIP712Domain,
} from '../types';
import { TokenBucketRateLimiter } from './rate-limiter/tokenBucket';
import { VoucherAccumulator } from './accumulator/voucherStore';

export interface PaywallConfig {
  merchantAddress: Address;
  vaultAddress: Address;
  tokenAddress: Address;
  chainId: number;
  pricePerCall: bigint;
  accumulator: VoucherAccumulator;
  rateLimiter?: TokenBucketRateLimiter;
}

export function createX402Paywall(config: PaywallConfig) {
  const rateLimiter = config.rateLimiter || new TokenBucketRateLimiter(20, 5);

  return async function handlePaywall(req: any, res: any, next: () => void) {
    const rawHeader = req.headers['x-paythos-voucher'] || req.headers['x-payment-voucher'];

    if (!rawHeader) {
      res.writeHead(402, {
        'Content-Type': 'application/json',
        'X-Paythos-Version': '2.0',
        'X-Paythos-Price': config.pricePerCall.toString(),
        'X-Paythos-Token': config.tokenAddress,
        'X-Paythos-Merchant': config.merchantAddress,
        'X-Paythos-Vault': config.vaultAddress,
      });
      return res.end(
        JSON.stringify({
          error: 'Payment Required',
          protocol: 'x402-v2',
          pricePerCall: config.pricePerCall.toString(),
          token: config.tokenAddress,
          merchant: config.merchantAddress,
          vault: config.vaultAddress,
          chainId: config.chainId,
        })
      );
    }

    let signedVoucher: SignedPaymentVoucher;
    try {
      const decoded = typeof rawHeader === 'string' && rawHeader.startsWith('{')
        ? JSON.parse(rawHeader)
        : JSON.parse(Buffer.from(rawHeader as string, 'base64').toString('utf8'));

      signedVoucher = {
        voucher: {
          token: decoded.voucher.token,
          merchant: decoded.voucher.merchant,
          agentKey: decoded.voucher.agentKey,
          sessionId: BigInt(decoded.voucher.sessionId),
          cumulativeAmount: BigInt(decoded.voucher.cumulativeAmount),
          expiresAt: BigInt(decoded.voucher.expiresAt),
          nonce: BigInt(decoded.voucher.nonce),
        },
        signature: decoded.signature,
      };
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Malformed X-Paythos-Voucher header' }));
    }

    const { voucher, signature } = signedVoucher;

    if (!rateLimiter.allowRequest(voucher.agentKey)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Rate limit exceeded. Too many requests.' }));
    }

    const domain = getEIP712Domain(config.vaultAddress, config.chainId);
    const isValid = await verifyTypedData({
      address: voucher.agentKey,
      domain,
      types: PAYTHOS_EIP712_TYPES,
      primaryType: 'PaymentVoucher',
      message: voucher,
      signature,
    });

    if (!isValid) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid EIP-712 voucher signature' }));
    }

    const existing = config.accumulator.getChannel(voucher.agentKey, voucher.merchant, voucher.sessionId);
    const lastAmount = existing ? existing.latestVoucher.voucher.cumulativeAmount : 0n;

    if (voucher.cumulativeAmount < lastAmount + config.pricePerCall) {
      res.writeHead(402, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          error: 'Insufficient incremental voucher amount',
          requiredDelta: config.pricePerCall.toString(),
          providedDelta: (voucher.cumulativeAmount - lastAmount).toString(),
        })
      );
    }

    await config.accumulator.recordVoucher(signedVoucher);
    next();
  };
}
