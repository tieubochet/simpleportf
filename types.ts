
// Represents an asset held by the user in their portfolio
export interface PortfolioAsset {
  id: string; // The unique ID from the crypto API (e.g., coingecko id: 'bitcoin')
  symbol: string;
  name: string;
  amount: number;
}

// Represents a single wallet containing multiple assets
export interface Wallet {
  id: string;
  name: string;
  assets: PortfolioAsset[];
}

// Represents a coin fetched from the search API
export interface Coin {
  id: string;
  symbol: string;
  name: string;
}

// A dictionary to store prices, mapping a coin's ID to its price data
export type PriceData = Record<string, { usd: number }>;