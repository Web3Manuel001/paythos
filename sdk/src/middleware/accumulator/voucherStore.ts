import { Address, Hex } from 'viem';
import { SignedPaymentVoucher } from '../../types';
import { PaythosVaultClient } from '../../client/vaultClient';

export interface ChannelState {
  latestVoucher: SignedPaymentVoucher;
  lastSettledAmount: bigint;
  pendingClaimableAmount: bigint;
  channelOpenedTimestamp: number;
  consecutiveFailures: number;
  nextAllowedFlushTimestamp: number;
  isFlushing: boolean;
}

export class VoucherAccumulator {
  onSettled?: (agentKey: Address, amount?: bigint) => void;
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
          console.error('[Paythos Accumulator] Sweep error:', err);
        });
      }, autoSweepIntervalMs);

      // Prevent timer from hanging CLI scripts or tests
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
    const nextRetry = existing ? existing.nextAllowedFlushTimestamp : 0;

    const updatedState: ChannelState = {
      latestVoucher: signedVoucher,
      lastSettledAmount: lastSettled,
      pendingClaimableAmount: pending,
      channelOpenedTimestamp: channelStartTime,
      consecutiveFailures: failures,
      nextAllowedFlushTimestamp: nextRetry,
      isFlushing: isCurrentlyFlushing,
    };
    this.channels.set(channelKey, updatedState);

    // Trigger flush if threshold reached, not currently in flight, and backoff expired
    if (pending >= this.settlementThreshold && !isCurrentlyFlushing && now >= nextRetry && this.vaultClient.walletClient) {
      return await this.flushChannel(channelKey);
    }

    return { settledOnChain: false };
  }

  async sweepStaleChannels(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    for (const [channelKey, state] of this.channels.entries()) {
      if (state.pendingClaimableAmount > 0n && !state.isFlushing && now >= state.nextAllowedFlushTimestamp && this.vaultClient.walletClient) {
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

    current.isFlushing = true;
    const voucherToFlush = current.latestVoucher;
    const amountToFlush = voucherToFlush.voucher.cumulativeAmount;
    const now = Math.floor(Date.now() / 1000);

    try {
      const txHash = await this.vaultClient.settleOnChain(voucherToFlush);

      // SUCCESS PATH: Re-read channel map to preserve any newer vouchers that arrived mid-flight
      const refreshed = this.channels.get(channelKey) || current;
      refreshed.lastSettledAmount = amountToFlush;
      refreshed.pendingClaimableAmount = refreshed.latestVoucher.voucher.cumulativeAmount - amountToFlush;
      refreshed.channelOpenedTimestamp = now;
      refreshed.consecutiveFailures = 0;
      refreshed.nextAllowedFlushTimestamp = 0;
      refreshed.isFlushing = false;
      this.channels.set(channelKey, refreshed);

      try {
        this.onSettled?.(refreshed.latestVoucher.voucher.agentKey, amountToFlush);
      } catch (callbackError) {
        // A host application's notification callback cannot turn a confirmed
        // chain settlement into a failed flush/retry.
        console.error('[Paythos Accumulator] onSettled callback failed:', callbackError);
      }
      return { settledOnChain: true, txHash };
    } catch (err) {
      // FAILURE PATH FIX: Re-read map so newer vouchers are NOT wiped on error!
      const refreshed = this.channels.get(channelKey) || current;
      refreshed.isFlushing = false;
      refreshed.consecutiveFailures += 1;

      // Exponential backoff: 60s, 120s, 240s... max 1 hour
      const backoffSeconds = Math.min(3600, 60 * Math.pow(2, refreshed.consecutiveFailures - 1));
      refreshed.nextAllowedFlushTimestamp = now + backoffSeconds;
      this.channels.set(channelKey, refreshed);

      console.error(
        `🚨 [Paythos Alert] Channel ${channelKey} settlement failed (${refreshed.consecutiveFailures} attempts). ` +
        `Next retry in ${backoffSeconds}s. Error:`,
        err
      );
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
