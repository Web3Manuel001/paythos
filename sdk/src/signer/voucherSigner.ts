import { privateKeyToAccount } from 'viem/accounts';
import { Address, Hex } from 'viem';
import {
  PaymentVoucher,
  SignedPaymentVoucher,
  PAYTHOS_EIP712_TYPES,
  getEIP712Domain,
} from '../types';
import { FileLedgerStore, PersistedChannel } from '../storage/store';

export interface AgentVoucherResult extends SignedPaymentVoucher {
  headerPayload: string;
}

export class AgentVoucherSigner {
  private account;
  public readonly agentAddress: Address;
  public readonly vaultAddress: Address;
  public readonly chainId: number;
  private store: FileLedgerStore;

  constructor(sessionPrivateKey: Hex, vaultAddress: Address, chainId: number, storageDir?: string) {
    this.account = privateKeyToAccount(sessionPrivateKey);
    this.agentAddress = this.account.address;
    this.vaultAddress = vaultAddress;
    this.chainId = chainId;
    this.store = new FileLedgerStore(storageDir || '.paythos-data');
  }

  async signCumulativePayment(
    merchant: Address,
    token: Address,
    deltaAmount: bigint,
    sessionId: bigint = 1n,
    ttlSeconds: bigint = 3600n
  ): Promise<AgentVoucherResult> {
    const channelKey = `${merchant.toLowerCase()}-${sessionId.toString()}-${token.toLowerCase()}`;
    
    // PERSISTENCE RECOVERY: Read previous state from disk to prevent restart desync
    const persisted: PersistedChannel | undefined = this.store.getChannel(channelKey);
    const previousCumulative = persisted ? BigInt(persisted.cumulativeAmount) : 0n;
    const previousNonce = persisted ? BigInt(persisted.lastNonce) : 0n;

    const newCumulative = previousCumulative + deltaAmount;
    const newNonce = previousNonce + 1n;
    const now = BigInt(Math.floor(Date.now() / 1000));

    const voucher: PaymentVoucher = {
      token,
      merchant,
      agentKey: this.agentAddress,
      sessionId,
      cumulativeAmount: newCumulative,
      expiresAt: now + ttlSeconds,
      nonce: newNonce,
    };

    const domain = getEIP712Domain(this.vaultAddress, this.chainId);

    const signature = await this.account.signTypedData({
      domain,
      types: PAYTHOS_EIP712_TYPES,
      primaryType: 'PaymentVoucher',
      message: voucher,
    });

    // Write-through to disk store immediately
    this.store.setChannel(channelKey, {
      channelKey,
      lastSettledAmount: persisted ? persisted.lastSettledAmount : '0',
      cumulativeAmount: newCumulative.toString(),
      lastNonce: newNonce.toString(),
      updatedAt: Date.now(),
    });

    const headerPayload = Buffer.from(
      JSON.stringify({
        voucher: {
          token: voucher.token,
          merchant: voucher.merchant,
          agentKey: voucher.agentKey,
          sessionId: voucher.sessionId.toString(),
          cumulativeAmount: voucher.cumulativeAmount.toString(),
          expiresAt: voucher.expiresAt.toString(),
          nonce: voucher.nonce.toString(),
        },
        signature,
      })
    ).toString('base64');

    return { voucher, signature, headerPayload };
  }

  getCurrentCumulative(merchant: Address, sessionId: bigint, token: Address): bigint {
    const channelKey = `${merchant.toLowerCase()}-${sessionId.toString()}-${token.toLowerCase()}`;
    const persisted = this.store.getChannel(channelKey);
    return persisted ? BigInt(persisted.cumulativeAmount) : 0n;
  }
}
