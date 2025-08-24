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

// Represents a single market index
export interface MarketIndex {
  name: string;
  value: string | number;
  change?: string | number;
  change_24h_btc?: string | number; // For exchange balance
  sentiment?: string; // For Fear & Greed
  sparkline?: number[]; // For sparkline charts
}

// Represents the collection of all market indices data
export interface MarketIndicesData {
  gold_future: MarketIndex;
  dxy: MarketIndex;
  btc_dominance: MarketIndex;
  btc_exchange_balance: MarketIndex;
  fear_and_greed: MarketIndex;
  open_interest: MarketIndex;
  liquidations: MarketIndex;
  avg_rsi: MarketIndex;
  altcoin_season_index: MarketIndex;
}

// Represents a snapshot of the portfolio's value on a given day
export interface PortfolioSnapshot {
  date: string; // ISO date string (YYYY-MM-DD)
  totalValue: number; // The total portfolio value on that day in USD
}
