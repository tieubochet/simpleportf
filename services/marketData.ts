import { MarketIndicesData } from '../types';
import { fetchMarketDataFromCoinGlass } from './coinglass';

/**
 * Fetches market indices data. 
 * This implementation uses the CoinGlass service as the data source.
 */
export async function fetchMarketIndices(): Promise<MarketIndicesData> {
  try {
    const data = await fetchMarketDataFromCoinGlass();
    return data;
  } catch (error) {
    console.error('Failed to fetch market indices:', error);
    // The UI layer will handle this error and show an appropriate message.
    throw error;
  }
}
