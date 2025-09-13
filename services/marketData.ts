import { MarketIndicesData, GroundingSource } from '../types';
import { fetchMarketDataFromGemini } from './gemini';

const getErrorState = (): MarketIndicesData => ({
    gold_future: { name: 'Gold Future', value: 'N/A', change: 0 },
    dxy: { name: 'US Dollar Index', value: 'N/A', change: 0 },
    btc_dominance: { name: 'Bitcoin Dominance', value: 'N/A', change: 0 },
    btc_exchange_balance: { name: 'BTC Exchange Balance', value: 'N/A', change_24h_btc: '0' },
    fear_and_greed: { name: 'Fear & Greed Index', value: 0, sentiment: 'N/A' },
    open_interest: { name: 'Open Interest', value: 'N/A', change: 0 },
    liquidations: { name: 'Liquidations', value: 'N/A', change: 0 },
    avg_rsi: { name: 'AVG RSI', value: 0, sentiment: 'N/A' },
    altcoin_season_index: { name: 'Altcoin Season Index', value: 0, sentiment: 'N/A' },
});


export async function fetchMarketIndices(): Promise<{ data: MarketIndicesData, sources: GroundingSource[] }> {
  try {
    return await fetchMarketDataFromGemini();
  } catch (error) {
    console.error('Failed to fetch and process market indices from Gemini:', error);
    // Return a default/error state object with empty sources
    return { data: getErrorState(), sources: [] };
  }
}
