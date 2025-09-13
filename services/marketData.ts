
import { MarketIndicesData } from '../types';
import { fetchMarketIndicesFromCoinGlass } from './coinglass';

/**
 * Fetches market indices.
 * This implementation uses the CoinGlass service as the data source.
 */
export async function fetchMarketIndices(): Promise<MarketIndicesData> {
  try {
    const data = await fetchMarketIndicesFromCoinGlass();
    return data;
  } catch (error) {
    console.error('Failed to fetch market indices:', error);
    // The UI layer will handle this error and show an appropriate message.
    throw error;
  }
}
