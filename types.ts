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

// Represents a source from Google Search grounding
export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}

// Represents a single market index item
export interface MarketIndex {
  name: string;
  value: string | number;
  change?: number; // percentage change
  changeBtc?: string; // special case for BTC exchange balance
  sentiment?: string; // e.g., 'Neutral', 'Fear'
}

// Represents the entire collection of market indices
// FIX: Update MarketIndicesData to support fields from multiple data sources (CoinGecko, CoinGlass).
// Made non-common fields optional to prevent type errors when a source doesn't provide them.
export interface MarketIndicesData {
  fear_and_greed: MarketIndex;
  btc_dominance: MarketIndex;
  eth_dominance?: MarketIndex;
  total_market_cap?: MarketIndex;
  total_volume_24h?: MarketIndex;
  active_cryptocurrencies?: MarketIndex;
  btc_exchange_balance?: MarketIndex;
  open_interest?: MarketIndex;
  liquidations?: MarketIndex;
  avg_rsi?: MarketIndex;
  altcoin_season_index?: MarketIndex;
}

// Represents a snapshot of the portfolio's value on a given day
export interface PortfolioSnapshot {
  date: string; // ISO date string (YYYY-MM-DD)
  totalValue: number; // The total portfolio value on that day in USD
}

// FIX: Add missing types for advanced market stats to resolve import errors.
// Represents a single chart-based stat
export interface ChartStat {
  name: string;
  value: string;
  change: number; // percentage change
  sparkline: string; // SVG path data for the sparkline
}

// Represents the AVG RSI gauge stat
export interface RsiGaugeStat {
  name: string;
  value: number;
  sentiment: string;
}

// Represents the Altcoin Season Index gauge stat
export interface SeasonGaugeStat {
  name: string;
  value: number;
  sentiment: string;
}

// Represents the entire collection of advanced market stats
export interface AdvancedMarketStatsData {
  openInterest: ChartStat;
  liquidations: ChartStat;
  avgRsi: RsiGaugeStat;
  altcoinSeason: SeasonGaugeStat;
}
