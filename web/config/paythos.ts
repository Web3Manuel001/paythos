export const PAYTHOS_CONFIG = {
  primary: {
    network: 'Arc Testnet',
    chainId: 5042002,
    chainName: 'Arc Testnet',
    rpcUrl: 'https://rpc.testnet.arc.io',
    blockExplorer: 'https://testnet.arcscan.app',
    gasAsset: 'USDC (Native)',
    vaultAddress: '0xa9d5525BE440831c64695d30c915DF303E0151EF' as `0x${string}`,
    nativeUsdcAddress: '0x3600000000000000000000000000000000000000' as `0x${string}`,
    verifiedSettlementTx: '0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d' as `0x${string}`,
    verifiedBlock: 68409300,
    protocolFeeBps: 150, // 1.50% fee verified on-chain
  },
  spoke: {
    network: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    vaultAddress: '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9' as `0x${string}`,
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  }
} as const;
