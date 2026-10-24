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
  }
} as const;
