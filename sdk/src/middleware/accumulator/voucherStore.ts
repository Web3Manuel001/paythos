import { Address, Hex } from 'viem';
import { SignedPaymentVoucher } from '../../types';
import { PaythosVaultClient } from '../../client/vaultClient';

export interface ChannelState {
  latestVoucher: SignedPaymentVoucher;
  lastSettledAmount: bigint;
  pendingClaimableAmount: bigint;
  lastSettledTimestamp: number;
}

export class VoucherAccumulator {
  private channels: Map<string, ChannelState> = new Map();
  private settlementThreshold: bigint; // e.g. 5_000_000n = $5.00 USDC
  private maxVoucherAgeSeconds: number; // Max time before forced flush (default: 20 mins)
  private vaultClient: PaythosVaultClient;

  constructor(
    vaultClient: PaythosVaultClient,
    settlementThreshold: bigint = 5_000_000n,
    maxVoucherAgeSeconds: number = 1200 // 20 minutes (prevents 1h expiry loss)
  ) {
    this.vaultClient = vaultClient;
    this.settlementThreshold = settlementThreshold;
    this.maxVoucherAgeSeconds = maxVoucherAgeSeconds;
  }

  private getChannelKey(agentKey: Address, merchant: Address, sessionId: bigint): string {
    return `${agentKey.toLowerCase()}-${merchant.toLowerCase()}-${sessionId.toString()}`;
  }

  async recordVoucher(signedVoucher: SignedPaymentVoucher): Promise<{
    settledOnChain: boolean;
    txHash?: Hex;
  }> {
    const { voucher } = signedVoucher;
    const channelKey = this.getChannelKey(voucher.agentKey, voucher.merchant, voucher.sessionId);
    const existing = this.channels.get(channelKey);

    let lastSettled = existing ? existing.lastSettledAmount : 0n;
    const now = Math.floor(Date.now() / 1000);

    if (!existing) {
      try {
        lastSettled = await this.vaultClient.getSettledAmount(
          voucher.agentKey,
          voucher.merchant,
          voucher.sessionId,
          voucher.token
        );
      } catch {
        lastSettled = 0n;
      }
    }

    const pending = voucher.cumulativeAmount - lastSettled;
    const channelStartTime = existing ? existing.lastSettledTimestamp : now;
    const voucherAge = now - channelStartTime;

    const updatedState: ChannelState = {
      latestVoucher: signedVoucher,
      lastSettledAmount: lastSettled,
      pendingClaimableAmount: pending,
      lastSettledTimestamp: channelStartTime,
    };
    this.channels.set(channelKey, updatedState);

    // Dual Flush Trigger: Balance Threshold OR Time Window Expiry Protection
    const shouldFlush = 
      pending > 0n && (pending >= this.settlementThreshold || voucherAge >= this.maxVoucherAgeSeconds);

    if (shouldFlush && this.vaultClient.walletClient) {
      try {
        const txHash = await this.vaultClient.settleOnChain(signedVoucher);
        updatedState.lastSettledAmount = voucher.cumulativeAmount;
        updatedState.pendingClaimableAmount = 0n;
        updatedState.lastSettledTimestamp = now;
        this.channels.set(channelKey, updatedState);

        return { settledOnChain: true, txHash };
      } catch (err) {
        console.error('[Paythos Accumulator] Failed to flush on-chain voucher:', err);
      }
    }

    return { settledOnChain: false };
  }

  getChannel(agentKey: Address, merchant: Address, sessionId: bigint): ChannelState | undefined {
    return this.channels.get(this.getChannelKey(agentKey, merchant, sessionId));
  }
}
