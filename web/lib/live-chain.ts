import { createPublicClient, defineChain, http, isAddress, type Address } from 'viem';
import { PAYTHOS_CONFIG } from '@/config/paythos';

const arcTestnet = defineChain({
  id: PAYTHOS_CONFIG.primary.chainId,
  name: PAYTHOS_CONFIG.primary.chainName,
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: { default: { http: [process.env.PAYTHOS_RPC_URL || PAYTHOS_CONFIG.primary.rpcUrl] } },
  blockExplorers: { default: { name: 'ArcScan', url: PAYTHOS_CONFIG.primary.blockExplorer } },
  testnet: true,
});

const vaultAbi = [
  {
    type: 'function',
    name: 'settlementToken',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const;

export type ArcLiveData =
  | {
      available: true;
      vaultAddress: Address;
      chainId: number;
      blockNumber: bigint;
      settlementToken: Address;
      proofStatus: 'confirmed' | 'failed' | 'mismatched' | 'unavailable';
      proofBlock: bigint | null;
      checkedAt: string;
    }
  | { available: false; vaultAddress: string; reason: string; checkedAt: string };

export async function getArcLiveData(): Promise<ArcLiveData> {
  const checkedAt = new Date().toISOString();
  const configuredVault = process.env.PAYTHOS_VAULT_ADDRESS || PAYTHOS_CONFIG.primary.vaultAddress;
  if (!isAddress(configuredVault)) {
    return { available: false, vaultAddress: configuredVault, reason: 'The configured vault address is invalid.', checkedAt };
  }

  const client = createPublicClient({ chain: arcTestnet, transport: http() });

  try {
    const chainId = await client.getChainId();
    if (chainId !== PAYTHOS_CONFIG.primary.chainId) {
      throw new Error(`RPC returned chain ${chainId}; expected Arc Testnet (${PAYTHOS_CONFIG.primary.chainId}).`);
    }

    const [blockNumber, settlementToken, proof] = await Promise.all([
      client.getBlockNumber(),
      client.readContract({
        address: configuredVault,
        abi: vaultAbi,
        functionName: 'settlementToken',
      }),
      client.getTransactionReceipt({ hash: PAYTHOS_CONFIG.primary.verifiedSettlementTx }).catch(() => null),
    ]);

    return {
      available: true,
      vaultAddress: configuredVault,
      chainId,
      blockNumber,
      settlementToken,
      proofStatus: proof
        ? proof.to?.toLowerCase() !== configuredVault.toLowerCase()
          ? 'mismatched'
          : proof.status === 'success' ? 'confirmed' : 'failed'
        : 'unavailable',
      proofBlock: proof?.blockNumber ?? null,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      available: false,
      vaultAddress: configuredVault,
      reason: error instanceof Error ? error.message : 'The Arc RPC request failed.',
      checkedAt: new Date().toISOString(),
    };
  }
}
