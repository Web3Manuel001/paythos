'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { defineChain } from 'viem';

const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.io'] } },
  blockExplorers: { default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' } },
  testnet: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const rawAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const isConfigured = rawAppId && !rawAppId.includes('xxx') && !rawAppId.includes('insert-');

  // If Privy is not yet configured, render children cleanly without crashing SSG
  if (!isConfigured) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={rawAppId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#f4f4f5',
          showWalletLoginFirst: false,
        },
        loginMethods: ['google', 'twitter', 'email', 'wallet'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: arcTestnet,
        supportedChains: [arcTestnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
