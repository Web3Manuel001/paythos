import { privateKeyToAccount } from 'viem/accounts';
import { Address, Hex } from 'viem';
import {
  PaymentVoucher,
  SignedPaymentVoucher,
  PAYTHOS_EIP712_TYPES,
  getEIP712Domain,
} from '../types';

export class AgentVoucherSigner {
  private account;
  public readonly agentAddress: Address;
  public readonly vaultAddress: Address;
  public readonly chainId: number;

  // In-memory monotonic cumulative counters keyed by: merchant-sessionId
  private cumulativeSpendLedger: Map<string, bigint> = new Map();
  private nonceCounter: bigint = 0n;

  constructor(sessionPrivateKey: Hex, vaultAddress: Address, chainId: number) {
    this.account = privateKeyToAccount(sessionPrivateKey);
    this.agentAddress = this.account.address;
    this.vaultAddress = vaultAddress;
    this.chainId = chainId;
  }

  /**
   * Generates and signs a cumulative payment voucher off-chain in < 1ms.
   * @param merchant The recipient API provider address
   * @param token The ERC-20 token address (USDC on Base)
   * @param deltaAmount The incremental cost of this API hit (in atomic units)
   * @param sessionId Unique session identifier
   * @param ttlSeconds Voucher validity duration (default: 1 hour)
   */
  async signCumulativePayment(
    merchant: Address,
    token: Address,
    deltaAmount: bigint,
    sessionId: bigint = 1n,
    ttlSeconds: bigint = 3600n
  ): Promise<SignedPaymentVoucher> {
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

    // Update in-memory monotonic counter
    this.cumulativeSpendLedger.set(channelKey, newCumulative);

    return { voucher, signature };
  }

  getCurrentCumulative(merchant: Address, sessionId: bigint, token: Address): bigint {
    const channelKey = `${merchant.toLowerCase()}-${sessionId.toString()}-${token.toLowerCase()}`;
    return this.cumulativeSpendLedger.get(channelKey) || 0n;
  }
}
