import { Address, Hex } from 'viem';
import { SignedPaymentVoucher } from '../../types';
import { PaythosVaultClient } from '../../client/vaultClient';

export interface ChannelState {
  latestVoucher: SignedPaymentVoucher;
  lastSettledAmount: bigint;
  pendingClaimableAmount: bigint;
  channelOpenedTimestamp: number;
  consecutiveFailures: number;
  isFlushing: boolean;
}

export class VoucherAccumulator {
  private channels: Map<string, ChannelState> = new Map();
  private settlementThreshold: bigint;
  private maxVoucherAgeSeconds: number;
  private vaultClient: PaythosVaultClient;
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor(
    vaultClient: PaythosVaultClient,
    settlementThreshold: bigint = 5_000_000n,
    maxVoucherAgeSeconds: number = 1200, // 20 minutes
    autoSweepIntervalMs: number = 60_000 // 60 seconds
  ) {
    this.vaultClient = vaultClient;
    this.settlementThreshold = settlementThreshold;
    this.maxVoucherAgeSeconds = maxVoucherAgeSeconds;

    if (autoSweepIntervalMs > 0 && typeof setInterval !== 'undefined') {
      this.sweepTimer = setInterval(() => {
        this.sweepStaleChannels().catch((err) => {
          console.error('[Paythos Accumulator] Background sweep error:', err);
        });
      }, autoSweepIntervalMs);

      // CRITICAL: .unref() prevents this timer from hanging Node.js CLI scripts or tests
      if (this.sweepTimer && typeof this.sweepTimer.unref === 'function') {
        this.sweepTimer.unref();
      }
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
    const isCurrentlyFlushing = existing ? existing.isFlushing : false;
    const failures = existing ? existing.consecutiveFailures : 0;

    const updatedState: ChannelState = {
      latestVoucher: signedVoucher,
      lastSettledAmount: lastSettled,
      pendingClaimableAmount: pending,
      channelOpenedTimestamp: channelStartTime,
      consecutiveFailures: failures,
      isFlushing: isCurrentlyFlushing,
    };
    this.channels.set(channelKey, updatedState);

    // Flush if threshold reached and not already mid-flight
    if (pending >= this.settlementThreshold && !isCurrentlyFlushing && this.vaultClient.walletClient) {
      return await this.flushChannel(channelKey);
    }

    return { settledOnChain: false };
  }

  async sweepStaleChannels(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    for (const [channelKey, state] of this.channels.entries()) {
      if (state.pendingClaimableAmount > 0n && !state.isFlushing && state.consecutiveFailures < 3 && this.vaultClient.walletClient) {
        const age = now - state.channelOpenedTimestamp;
        if (age >= this.maxVoucherAgeSeconds || state.pendingClaimableAmount >= this.settlementThreshold) {
          await this.flushChannel(channelKey);
        }
      }
    }
  }

  private async flushChannel(channelKey: string): Promise<{ settledOnChain: boolean; txHash?: Hex }> {
    const current = this.channels.get(channelKey);
    if (!current || current.isFlushing) return { settledOnChain: false };

    // Lock channel to prevent race conditions during network latency
    current.isFlushing = true;
    const voucherToFlush = current.latestVoucher;
    const amountToFlush = voucherToFlush.voucher.cumulativeAmount;

    try {
      const txHash = await this.vaultClient.settleOnChain(voucherToFlush);

      // RACE CONDITION FIX: Re-read the map entry after transaction completes!
      // If a newer voucher arrived while tx was in flight, do NOT overwrite it!
      const refreshed = this.channels.get(channelKey) || current;
      refreshed.lastSettledAmount = amountToFlush;
      refreshed.pendingClaimableAmount = refreshed.latestVoucher.voucher.cumulativeAmount - amountToFlush;
      refreshed.channelOpenedTimestamp = Math.floor(Date.now() / 1000);
      refreshed.consecutiveFailures = 0;
      refreshed.isFlushing = false;
      this.channels.set(channelKey, refreshed);

      return { settledOnChain: true, txHash };
    } catch (err) {
      current.isFlushing = false;
      current.consecutiveFailures += 1;
      this.channels.set(channelKey, current);
      console.error(`[Paythos Accumulator] Settlement failed (Attempt ${current.consecutiveFailures}/3):`, err);
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
