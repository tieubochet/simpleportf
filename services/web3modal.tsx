import React from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';

import { WagmiProvider } from 'wagmi';
import { base, celo, mainnet, optimism } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Chain } from 'viem';

// 0. Get projectId from environment variables
// IMPORTANT: User must set this in their environment (e.g., in a .env.local file).
const projectId = (import.meta as any).env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
    console.error("VITE_WALLETCONNECT_PROJECT_ID is not set. Please get a project ID from https://cloud.walletconnect.com and add it to your environment variables.");
}

// 1. Define custom chains
const unichain: Chain = {
    id: 130,
    name: 'Unichain',
    nativeCurrency: { name: 'Unichain', symbol: 'UNI', decimals: 18 },
    rpcUrls: { default: { http: ['https://mainnet.unichain.org'] } },
    blockExplorers: { default: { name: 'Uniscan', url: 'https://uniscan.xyz' } },
} as const;

const monad: Chain = {
    id: 80084,
    name: 'Monad Devnet',
    nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.devnet.monad.xyz'] } },
    blockExplorers: { default: { name: 'Monad Explorer', url: 'https://explorer.devnet.monad.xyz' } },
} as const;

// 2. Create wagmiConfig
const metadata = {
  name: 'Crypto Portfolio Tracker',
  description: 'A personal cryptocurrency portfolio tracker.',
  url: window.location.origin,
  icons: ['/icons/icon-512x512.png']
};

const chains = [mainnet, base, optimism, celo, unichain, monad] as const;
const config = defaultWagmiConfig({
  chains,
  projectId: projectId || "1", // Fallback to avoid crashing if env var is missing
  metadata,
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: projectId || "1",
  chains,
  enableAnalytics: true, 
});

// 4. Create QueryClient
const queryClient = new QueryClient();

// 5. Create AppProviders component
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}