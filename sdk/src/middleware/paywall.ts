import { verifyTypedData, Address } from 'viem';
import {
  SignedPaymentVoucher,
  PAYTHOS_EIP712_TYPES,
  getEIP712Domain,
} from '../types';
import { TokenBucketRateLimiter } from './rate-limiter/tokenBucket';
import { VoucherAccumulator } from './accumulator/voucherStore';
import { PaythosVaultClient } from '../client/vaultClient';

export { VoucherAccumulator };

export interface PaywallConfig {
  merchantAddress: Address;
  vaultAddress: Address;
  tokenAddress: Address; // Canonical USDC
  chainId: number;
  pricePerCall: bigint;
  accumulator: VoucherAccumulator;
  vaultClient: PaythosVaultClient;
  rateLimiter?: TokenBucketRateLimiter;
}

export function createX402Paywall(config: PaywallConfig) {
  const rateLimiter = config.rateLimiter || new TokenBucketRateLimiter(20, 5);
  
  // In-memory caches (prevents RPC hammering)
  const sessionCache: Map<string, { dailyLimit: bigint; spentToday: bigint; expiresAt: bigint; lastChecked: number }> = new Map();
  let vaultBalanceCache: { balance: bigint; lastChecked: number } = { balance: 0n, lastChecked: 0 };

  return async function handlePaywall(req: any, res: any, next: () => void) {
    const rawHeader = req.headers['x-paythos-voucher'] || req.headers['x-payment-voucher'];

    if (!rawHeader) {
      res.writeHead(402, {
        'Content-Type': 'application/json',
        'X-Paythos-Version': '2.1',
        'X-Paythos-Price': config.pricePerCall.toString(),
        'X-Paythos-Token': config.tokenAddress,
        'X-Paythos-Merchant': config.merchantAddress,
        'X-Paythos-Vault': config.vaultAddress,
        'X-Paythos-Chain-Id': config.chainId.toString(),
      });
      return res.end(
        JSON.stringify({
          error: 'Payment Required',
          protocol: 'x402-v2.1',
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

    // 1. Strict Bound Field Checks
    if (voucher.merchant.toLowerCase() !== config.merchantAddress.toLowerCase()) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Voucher merchant mismatch' }));
    }
    if (voucher.token.toLowerCase() !== config.tokenAddress.toLowerCase()) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Voucher token mismatch' }));
    }
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (now > voucher.expiresAt) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Voucher expired' }));
    }

    // 2. Rate Limiting Check (HTTP 429)
    if (!rateLimiter.allowRequest(voucher.agentKey)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Rate limit exceeded. Too many requests.' }));
    }

    // 3. EIP-712 Cryptographic Signature Verification
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

    // 4. Calculate Total Unsettled Debt (Mathematical Fix)
    const existing = config.accumulator.getChannel(voucher.agentKey, voucher.merchant, voucher.sessionId);
    const lastSettled = existing ? existing.lastSettledAmount : 0n;
    const unsettled = voucher.cumulativeAmount - lastSettled;

    const lastAmount = existing ? existing.latestVoucher.voucher.cumulativeAmount : 0n;
    const payoutDelta = voucher.cumulativeAmount - lastAmount;

    if (payoutDelta < config.pricePerCall) {
      res.writeHead(402, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          error: 'Insufficient incremental voucher amount',
          requiredDelta: config.pricePerCall.toString(),
          providedDelta: payoutDelta.toString(),
        })
      );
    }

    // 5. ON-CHAIN SESSION & TOTAL UNSETTLED CAP ENFORCEMENT
    const agentLower = voucher.agentKey.toLowerCase();
    const cached = sessionCache.get(agentLower);
    const nowMs = Date.now();
    let session = cached;

    if (!cached || nowMs - cached.lastChecked > 120_000) {
      try {
        const onChain = await config.vaultClient.getSession(voucher.agentKey);
        if (!onChain.isActive || now > onChain.expiresAt) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Agent session inactive or expired on-chain' }));
        }

        session = {
          dailyLimit: onChain.dailyLimit,
          spentToday: onChain.spentToday,
          expiresAt: onChain.expiresAt,
          lastChecked: nowMs,
        };
        sessionCache.set(agentLower, session);
      } catch {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unable to verify on-chain session. Failing closed.' }));
      }
    }

    // STRICT UNSETTLED CAP CHECK (Auditor Mathematical Fix)
    if (session) {
      if (session.spentToday + unsettled > session.dailyLimit) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({
            error: 'On-chain daily spend cap exceeded by total unsettled debt',
            dailyLimit: session.dailyLimit.toString(),
            spentToday: session.spentToday.toString(),
            unsettledClaim: unsettled.toString(),
          })
        );
      }
    }

    // 6. ON-CHAIN VAULT SOLVENCY CHECK (Cached for 30 seconds)
    let currentVaultBalance = vaultBalanceCache.balance;
    if (nowMs - vaultBalanceCache.lastChecked > 30_000) {
      try {
        currentVaultBalance = await config.vaultClient.publicClient.readContract({
          address: config.tokenAddress,
          abi: [{ type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' }],
          functionName: 'balanceOf',
          args: [config.vaultAddress],
        });
        vaultBalanceCache = { balance: currentVaultBalance, lastChecked: nowMs };
      } catch {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unable to verify vault collateral solvency' }));
      }
    }

    // STRICT SOLVENCY: Available vault balance must cover the TOTAL unsettled debt
    if (currentVaultBalance < unsettled) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          error: 'Vault insolvent: insufficient on-chain USDC collateral to back outstanding claims',
          vaultBalance: currentVaultBalance.toString(),
          unsettledRequired: unsettled.toString(),
        })
      );
    }

    // 7. Record voucher in accumulator
    await config.accumulator.recordVoucher(signedVoucher);
    next();
  };
}
