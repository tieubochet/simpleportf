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

// FIX: Add missing types for market indices to resolve import errors.
// Represents a generic market index with a value and change
export interface MarketIndex {
  name: string;
  value: string;
  change: number;
}

// Represents a gauge-style market index with a value and sentiment
export interface GaugeIndex {
  name: string;
  value: number;
  sentiment: string;
}

// Represents the specific structure for BTC exchange balance
export interface BtcBalanceIndex {
    name: string;
    value: string;
    changeBtc: string;
}

// Represents a simple stat with a name and a string value
export interface SimpleValueIndex {
  name: string;
  value: string;
}

// Represents the complete data structure for market indices fetched from external services
export interface MarketIndicesData {
  gold_future: MarketIndex;
  dxy: MarketIndex;
  btc_dominance: MarketIndex;
  btc_exchange_balance: BtcBalanceIndex;
  fear_and_greed: GaugeIndex;
  open_interest: MarketIndex;
  liquidations: MarketIndex;
  avg_rsi: GaugeIndex;
  altcoin_season_index: GaugeIndex;
  eth_gas_price: SimpleValueIndex;
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