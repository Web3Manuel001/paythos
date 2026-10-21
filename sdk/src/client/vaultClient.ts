import {
  createPublicClient,
  createWalletClient,
  http,
  Address,
  Hex,
  PublicClient,
  WalletClient,
} from 'viem';
import { SignedPaymentVoucher, SessionPolicy } from '../types';

export const PAYTHOS_VAULT_ABI = [
  {
    type: 'function',
    name: 'settleVoucher',
    inputs: [
      {
        name: 'voucher',
        type: 'tuple',
        components: [
          { name: 'token', type: 'address' },
          { name: 'merchant', type: 'address' },
          { name: 'agentKey', type: 'address' },
          { name: 'sessionId', type: 'uint256' },
          { name: 'cumulativeAmount', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
      },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'settleVoucherWithMemo',
    inputs: [
      {
        name: 'voucher',
        type: 'tuple',
        components: [
          { name: 'token', type: 'address' },
          { name: 'merchant', type: 'address' },
          { name: 'agentKey', type: 'address' },
          { name: 'sessionId', type: 'uint256' },
          { name: 'cumulativeAmount', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
      },
      { name: 'arcMemoHash', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'sessions',
    inputs: [{ name: 'agentKey', type: 'address' }],
    outputs: [
      { name: 'dailyLimit', type: 'uint256' },
      { name: 'spentToday', type: 'uint256' },
      { name: 'lastResetTimestamp', type: 'uint256' },
      { name: 'expiresAt', type: 'uint256' },
      { name: 'revokedAt', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'settledAmount',
    inputs: [{ name: 'channelKey', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'settlementToken',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getChannelKey',
    inputs: [
      { name: 'agentKey', type: 'address' },
      { name: 'merchant', type: 'address' },
      { name: 'sessionId', type: 'uint256' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'pure',
  },
] as const;

export class PaythosVaultClient {
  public publicClient: PublicClient;
  public walletClient?: WalletClient;
  public vaultAddress: Address;

  constructor(vaultAddress: Address, rpcUrl: string, walletClient?: WalletClient) {
    this.vaultAddress = vaultAddress;
    this.publicClient = createPublicClient({ transport: http(rpcUrl) });
    this.walletClient = walletClient;
  }

  async getSession(agentKey: Address): Promise<SessionPolicy> {
    const data = await this.publicClient.readContract({
      address: this.vaultAddress,
      abi: PAYTHOS_VAULT_ABI,
      functionName: 'sessions',
      args: [agentKey],
    });

    return {
      dailyLimit: data[0],
      spentToday: data[1],
      lastResetTimestamp: data[2],
      expiresAt: data[3],
      revokedAt: data[4],
      isActive: data[5],
    };
  }

  async getSettledAmount(
    agentKey: Address,
    merchant: Address,
    sessionId: bigint,
    token: Address
  ): Promise<bigint> {
    const channelKey = await this.publicClient.readContract({
      address: this.vaultAddress,
      abi: PAYTHOS_VAULT_ABI,
      functionName: 'getChannelKey',
      args: [agentKey, merchant, sessionId, token],
    });

    return await this.publicClient.readContract({
      address: this.vaultAddress,
      abi: PAYTHOS_VAULT_ABI,
      functionName: 'settledAmount',
      args: [channelKey],
    });
  }

  async settleOnChain(signedVoucher: SignedPaymentVoucher): Promise<Hex> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error('WalletClient with active account required for settlement');
    }

    const { request } = await this.publicClient.simulateContract({
      account: this.walletClient.account,
      address: this.vaultAddress,
      abi: PAYTHOS_VAULT_ABI,
      functionName: 'settleVoucher',
      args: [signedVoucher.voucher, signedVoucher.signature],
    });

    return await this.walletClient.writeContract(request);
  }

  async settleOnChainWithMemo(signedVoucher: SignedPaymentVoucher, arcMemoHash: Hex): Promise<Hex> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error('WalletClient with active account required for settlement');
    }

    const { request } = await this.publicClient.simulateContract({
      account: this.walletClient.account,
      address: this.vaultAddress,
      abi: PAYTHOS_VAULT_ABI,
      functionName: 'settleVoucherWithMemo',
      args: [signedVoucher.voucher, arcMemoHash, signedVoucher.signature],
    });

    return await this.walletClient.writeContract(request);
  }
}
