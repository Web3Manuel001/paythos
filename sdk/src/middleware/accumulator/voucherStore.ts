import { Address, Hex } from 'viem';
import { SignedPaymentVoucher } from '../../types';
import { PaythosVaultClient } from '../../client/vaultClient';

export interface ChannelState {
  latestVoucher: SignedPaymentVoucher;
  lastSettledAmount: bigint;
  pendingClaimableAmount: bigint;
  channelOpenedTimestamp: number;
}

export class VoucherAccumulator {
  private channels: Map<string, ChannelState> = new Map();
  private settlementThreshold: bigint; // e.g. 5_000_000n = $5.00 USDC
  private maxVoucherAgeSeconds: number; // Stale voucher cutoff (default: 20 mins)
  private vaultClient: PaythosVaultClient;
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor(
    vaultClient: PaythosVaultClient,
    settlementThreshold: bigint = 5_000_000n,
    maxVoucherAgeSeconds: number = 1200, // 20 minutes
    autoSweepIntervalMs: number = 60_000 // Background sweep every 60 seconds
  ) {
    this.vaultClient = vaultClient;
    this.settlementThreshold = settlementThreshold;
    this.maxVoucherAgeSeconds = maxVoucherAgeSeconds;

    // Real background sweep timer (guarantees flush even if traffic halts)
    if (autoSweepIntervalMs > 0 && typeof setInterval !== 'undefined') {
      this.sweepTimer = setInterval(() => {
        this.sweepStaleChannels().catch((err) => {
          console.error('[Paythos Accumulator] Background sweep error:', err);
        });
      }, autoSweepIntervalMs);
    }
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
    const channelStartTime = existing ? existing.channelOpenedTimestamp : now;

    const updatedState: ChannelState = {
      latestVoucher: signedVoucher,
      lastSettledAmount: lastSettled,
      pendingClaimableAmount: pending,
      channelOpenedTimestamp: channelStartTime,
    };
    this.channels.set(channelKey, updatedState);

    // Immediate flush if threshold is exceeded
    if (pending >= this.settlementThreshold && this.vaultClient.walletClient) {
      return await this.flushChannel(channelKey, updatedState);
    }

    return { settledOnChain: false };
  }

  /**
   * Sweeps all channels and flushes any voucher older than maxVoucherAgeSeconds
   */
  async sweepStaleChannels(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    for (const [channelKey, state] of this.channels.entries()) {
      if (state.pendingClaimableAmount > 0n && this.vaultClient.walletClient) {
        const age = now - state.channelOpenedTimestamp;
        if (age >= this.maxVoucherAgeSeconds || state.pendingClaimableAmount >= this.settlementThreshold) {
          await this.flushChannel(channelKey, state);
        }
      }
    }
  }

  private async flushChannel(channelKey: string, state: ChannelState): Promise<{ settledOnChain: boolean; txHash?: Hex }> {
    try {
      const txHash = await this.vaultClient.settleOnChain(state.latestVoucher);
      state.lastSettledAmount = state.latestVoucher.voucher.cumulativeAmount;
      state.pendingClaimableAmount = 0n;
      state.channelOpenedTimestamp = Math.floor(Date.now() / 1000);
      this.channels.set(channelKey, state);

      return { settledOnChain: true, txHash };
    } catch (err) {
      console.error(`[Paythos Accumulator] Failed to flush channel ${channelKey}:`, err);
      return { settledOnChain: false };
    }
  }

  getChannel(agentKey: Address, merchant: Address, sessionId: bigint): ChannelState | undefined {
    return this.channels.get(this.getChannelKey(agentKey, merchant, sessionId));
  }

  stopSweepTimer(): void {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
  }
}
