import React from 'react'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider, createConfig, http } from '@wagmi/core'
import { base, celo, mainnet, optimism } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Chain } from 'viem'

// 0. Get projectId from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string

if (!projectId) {
  console.error(
    'VITE_WALLETCONNECT_PROJECT_ID is not set. Please create one at https://cloud.walletconnect.com and add it to your environment variables.'
  )
}

// 1. Define custom chains
const unichain: Chain = {
  id: 130,
  name: 'Unichain',
  nativeCurrency: { name: 'Unichain', symbol: 'UNI', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.unichain.org'] } },
  blockExplorers: { default: { name: 'Uniscan', url: 'https://uniscan.xyz' } }
} as const

const monad: Chain = {
  id: 80084,
  name: 'Monad Devnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.devnet.monad.xyz'] } },
  blockExplorers: { default: { name: 'Monad Explorer', url: 'https://explorer.devnet.monad.xyz' } }
} as const

// 2. Define chains
const chains = [mainnet, base, optimism, celo, unichain, monad] as const

// 3. Create wagmi config
const config = createConfig({
  chains,
  transports: Object.fromEntries(
    chains.map(chain => [chain.id, http(chain.rpcUrls.default.http[0])])
  ),
  ssr: true // Vercel build cần SSR-safe
})

// 4. Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: projectId || '1',
  metadata: {
    name: 'Crypto Portfolio Tracker',
    description: 'A personal cryptocurrency portfolio tracker.',
    url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
    icons: ['/icons/icon-512x512.png']
  },
  enableAnalytics: true
})

// 5. Create QueryClient
const queryClient = new QueryClient()

// 6. Create AppProviders component
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
