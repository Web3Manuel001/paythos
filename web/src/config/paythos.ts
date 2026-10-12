export const PAYTHOS_CONFIG = {
  chainId: 84532, // Base Sepolia
  chainName: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  // Your live on-chain contract deployed in block 48001033
  vaultAddress: '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9' as `0x${string}`,
  // Base Sepolia Native USDC
  usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  protocolFeeBps: 150, // 1.50%
} as const;
