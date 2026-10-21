export const PAYTHOS_CONFIG = {
  // --- PRIMARY L1: ARC TESTNET ---
  primary: {
    network: 'Arc Testnet',
    chainId: 5042002,
    chainName: 'Arc Testnet',
    rpcUrl: 'https://rpc.testnet.arc.io',
    blockExplorer: 'https://testnet.arcscan.app',
    gasAsset: 'USDC (Native)',
    vaultAddress: '0xFb57ceAEF685B73Dc0270f806545e195393Cc277' as `0x${string}`,
    nativeUsdcAddress: '0x3600000000000000000000000000000000000000' as `0x${string}`,
    protocolFeeBps: 0, // 0% fee during ecosystem growth phase
  },
  // --- SECONDARY SPOKE: BASE SEPOLIA ---
  spoke: {
    network: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    vaultAddress: '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9' as `0x${string}`,
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  }
} as const;
