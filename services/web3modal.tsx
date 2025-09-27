import React from 'react';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

import { WagmiProvider } from 'wagmi';
import { base, celo, mainnet, optimism } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Chain } from 'viem';
import { BoltIcon } from '../components/icons';

// 0. Get projectId from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

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

const chains = [mainnet, base, optimism, celo, unichain, monad] as const;

// 2. Create metadata
const metadata = {
  name: 'Crypto Portfolio Tracker',
  description: 'A personal cryptocurrency portfolio tracker.',
  url: window.location.origin,
  icons: ['/icons/icon-512x512.png']
};

// 3. Create wagmiConfig and modal conditionally
let config: ReturnType<typeof defaultWagmiConfig> | undefined;

if (projectId) {
    config = defaultWagmiConfig({
        chains,
        projectId,
        metadata,
    });

    createWeb3Modal({
        wagmiConfig: config,
        projectId,
        enableAnalytics: true, 
    });
}

// 4. Create QueryClient
const queryClient = new QueryClient();

// 5. Create AppProviders component
export function AppProviders({ children }: { children: React.ReactNode }) {
    if (!projectId || !config) {
        return (
            <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl text-center max-w-md w-full">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                        <BoltIcon className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth="2.5" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Configuration Error</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        The WalletConnect Project ID is missing, so wallet features cannot be initialized.
                    </p>
                    <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                        Please ensure the <code>VITE_WALLETCONNECT_PROJECT_ID</code> environment variable is set in the deployment configuration.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}