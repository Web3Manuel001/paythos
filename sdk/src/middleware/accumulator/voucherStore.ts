import { Address, Hex } from 'viem';
import { SignedPaymentVoucher } from '../../types';
import { PaythosVaultClient } from '../../client/vaultClient';

export interface ChannelState {
  latestVoucher: SignedPaymentVoucher;
  lastSettledAmount: bigint;
  pendingClaimableAmount: bigint;
}

export class VoucherAccumulator {
  private channels: Map<string, ChannelState> = new Map();
  private settlementThreshold: bigint;
  private vaultClient: PaythosVaultClient;

  constructor(vaultClient: PaythosVaultClient, settlementThreshold: bigint = 5_000_000n) {
    this.vaultClient = vaultClient;
    this.settlementThreshold = settlementThreshold;
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

    const updatedState: ChannelState = {
      latestVoucher: signedVoucher,
      lastSettledAmount: lastSettled,
      pendingClaimableAmount: pending,
    };
    this.channels.set(channelKey, updatedState);

    if (pending >= this.settlementThreshold && this.vaultClient.walletClient) {
      try {
        const txHash = await this.vaultClient.settleOnChain(signedVoucher);
        updatedState.lastSettledAmount = voucher.cumulativeAmount;
        updatedState.pendingClaimableAmount = 0n;
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
