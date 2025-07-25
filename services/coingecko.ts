import { Coin, PriceData } from '../types';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function searchCoins(query: string): Promise<Coin[]> {
  if (!query) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${query}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // API returns coins, exchanges, nfts etc. We only want coins.
    return data.coins.slice(0, 10).map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
    }));
  } catch (error) {
    console.error('Failed to search coins:', error);
    return [];
  }
}

export async function fetchPrices(coinIds: string[]): Promise<PriceData> {
  if (coinIds.length === 0) return {};
  try {
    const ids = coinIds.join(',');
    const response = await fetch(`${API_BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: PriceData = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    throw error;
  }
}
