import { privateKeyToAccount } from 'viem/accounts';
import { Address, Hex } from 'viem';
import {
  PaymentVoucher,
  SignedPaymentVoucher,
  PAYTHOS_EIP712_TYPES,
  getEIP712Domain,
} from '../types';

export interface AgentVoucherResult extends SignedPaymentVoucher {
  headerPayload: string; // Base64 transmission-ready header
}

export class AgentVoucherSigner {
  private account;
  public readonly agentAddress: Address;
  public readonly vaultAddress: Address;
  public readonly chainId: number;

  private cumulativeSpendLedger: Map<string, bigint> = new Map();
  private nonceCounter: bigint = 0n;

  constructor(sessionPrivateKey: Hex, vaultAddress: Address, chainId: number) {
    this.account = privateKeyToAccount(sessionPrivateKey);
    this.agentAddress = this.account.address;
    this.vaultAddress = vaultAddress;
    this.chainId = chainId;
  }

  async signCumulativePayment(
    merchant: Address,
    token: Address,
    deltaAmount: bigint,
    sessionId: bigint = 1n,
    ttlSeconds: bigint = 3600n
  ): Promise<AgentVoucherResult> {
    const channelKey = `${merchant.toLowerCase()}-${sessionId.toString()}-${token.toLowerCase()}`;
    const previousCumulative = this.cumulativeSpendLedger.get(channelKey) || 0n;
    const newCumulative = previousCumulative + deltaAmount;

    this.nonceCounter += 1n;
    const now = BigInt(Math.floor(Date.now() / 1000));

    const voucher: PaymentVoucher = {
      token,
      merchant,
      agentKey: this.agentAddress,
      sessionId,
      cumulativeAmount: newCumulative,
      expiresAt: now + ttlSeconds,
      nonce: this.nonceCounter,
    };

    const domain = getEIP712Domain(this.vaultAddress, this.chainId);

    const signature = await this.account.signTypedData({
      domain,
      types: PAYTHOS_EIP712_TYPES,
      primaryType: 'PaymentVoucher',
      message: voucher,
    });

    this.cumulativeSpendLedger.set(channelKey, newCumulative);

    // Automatically encode transmission-ready base64 header
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
    return this.cumulativeSpendLedger.get(channelKey) || 0n;
  }
}
