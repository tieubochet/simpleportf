
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
    // Use the /coins/markets endpoint which provides all necessary data in one call
    const response = await fetch(`${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=7d`);

    if (!response.ok) {
      throw new Error('Network response for market data was not ok');
    }

    const marketsData: any[] = await response.json();

    const priceData: PriceData = {};
    
    marketsData.forEach(coin => {
      priceData[coin.id] = {
        usd: coin.current_price,
        usd_24h_change: coin.price_change_percentage_24h,
        usd_7d_change: coin.price_change_percentage_7d_in_currency,
        market_cap_rank: coin.market_cap_rank,
      };
    });

    return priceData;
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    throw error;
  }
}

export async function fetchGlobalMarketData() {
    try {
        const response = await fetch(`${API_BASE_URL}/global`);
        if (!response.ok) {
            throw new Error('Network response for global market data was not ok');
        }
        const data = await response.json();
        return data.data; // The actual data is nested under a 'data' key
    } catch (error) {
        console.error('Failed to fetch global market data:', error);
        throw error;
    }
}
