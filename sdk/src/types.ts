import type { Address, Hash } from 'viem';

// --- OFFICIAL x402 v2 SPECIFICATION SCHEMAS ---

export interface X402PaymentOption {
  scheme: 'exact';
  network: string; // CAIP-2 identifier (e.g. "eip155:8453", "eip155:31337")
  amount: string;  // Base units (e.g. "2500000" for 2.50 USDC)
  asset: Address;  // Contract address of token
  payTo: Address;  // Recipient address
  maxTimeoutSeconds?: number;
  extra?: {
    name?: string;
    symbol?: string;
    decimals?: number;
  };
}

export interface X402PaymentRequired {
  x402Version: 2;
  resource?: {
    url?: string;
    description?: string;
  };
  accepts: X402PaymentOption[];
  error?: string;
}

export interface X402PaymentSignature {
  x402Version: 2;
  scheme: 'exact';
  network: string;
  payload: {
    txHash: Hash;
    payer: Address;
    amount: string;
  };
}

export interface X402PaymentResponse {
  success: boolean;
  txHash: Hash;
  network: string;
  errorReason?: string | null;
}
// Export Paythos EIP-712 types
export * from './types/index';
