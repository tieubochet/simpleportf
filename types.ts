
// Represents a single buy or sell transaction
export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out';
  quantity: number;
  pricePerUnit: number; // Price in USD. For transfers, this will be 0.
  date: string; // ISO string for the date of the transaction
  notes?: string; // Optional field for user notes
  fee?: number; // Optional fee in USD for the transaction
}

// Represents an asset held by the user, composed of multiple transactions
export interface PortfolioAsset {
  id:string; // The unique ID from the crypto API (e.g., coingecko id: 'bitcoin')
  symbol: string;
  name: string;
  transactions: Transaction[];
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
export type PriceData = Record<string, { 
  usd: number; 
  usd_24h_change?: number; 
  usd_7d_change?: number;
  market_cap_rank?: number;
}>;

// Represents the data for the top performing asset
export interface PerformerData {
  id: string;
  name: string;
  symbol: string;
  change: number; // The 24h percentage change
}

// FIX: Added missing PortfolioSnapshot interface.
// Represents a daily snapshot of the portfolio's total value
export interface PortfolioSnapshot {
  date: string; // ISO string for the date of the snapshot (YYYY-MM-DD)
  totalValue: number; // Total value in USD on that day
}

// Represents the global market stats fetched from CoinGecko
export interface GlobalStatsData {
  active_cryptocurrencies: number;
  markets: number; // exchanges
  total_market_cap: number;
  market_cap_change_percentage_24h_usd: number;
  total_volume_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  eth_gas_price_gwei: number;
}