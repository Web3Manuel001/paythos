import { Address, Hex } from 'viem';

export interface PaymentVoucher {
  token: Address;
  merchant: Address;
  agentKey: Address;
  sessionId: bigint;
  cumulativeAmount: bigint;
  expiresAt: bigint;
  nonce: bigint;
}

export interface SignedPaymentVoucher {
  voucher: PaymentVoucher;
  signature: Hex;
}

export interface SessionPolicy {
  dailyLimit: bigint;
  spentToday: bigint;
  lastResetTimestamp: bigint;
  expiresAt: bigint;
  revokedAt: bigint;
  isActive: boolean;
}

export const PAYTHOS_EIP712_TYPES = {
  PaymentVoucher: [
    { name: 'token', type: 'address' },
    { name: 'merchant', type: 'address' },
    { name: 'agentKey', type: 'address' },
    { name: 'sessionId', type: 'uint256' },
    { name: 'cumulativeAmount', type: 'uint256' },
    { name: 'expiresAt', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const;

export function getEIP712Domain(vaultAddress: Address, chainId: number) {
  return {
    name: 'PaythosVault',
    version: '1',
    chainId: BigInt(chainId),
    verifyingContract: vaultAddress,
  } as const;
}
