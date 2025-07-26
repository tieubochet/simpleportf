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
    const currentPriceResponse = await fetch(`${API_BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
    if (!currentPriceResponse.ok) {
      throw new Error('Network response for current prices was not ok');
    }
    const priceData: PriceData = await currentPriceResponse.json();

    // Fetch prices from 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = `${sevenDaysAgo.getDate()}-${sevenDaysAgo.getMonth() + 1}-${sevenDaysAgo.getFullYear()}`;

    const historicalPricePromises = coinIds.map(id =>
      fetch(`${API_BASE_URL}/coins/${id}/history?date=${dateStr}&localization=false`)
        .then(res => {
          if (res.ok) return res.json();
          // Log non-ok responses but don't fail the whole batch
          console.warn(`Could not fetch 7-day history for ${id} (status: ${res.status}). New coins may not have historical data.`);
          return null;
        })
        .then(historicalData => ({
          id,
          price: historicalData?.market_data?.current_price?.usd ?? null,
        }))
        .catch(error => {
            console.error(`Fetch error for ${id} history:`, error);
            return { id, price: null }; // Ensure promise doesn't reject
        })
    );

    const historicalResults = await Promise.all(historicalPricePromises);

    // Combine data and calculate 7d change
    historicalResults.forEach(historical => {
      if (priceData[historical.id] && historical.price !== null) {
        const currentPrice = priceData[historical.id].usd;
        const oldPrice = historical.price;
        if (currentPrice && oldPrice > 0) {
          const change = ((currentPrice - oldPrice) / oldPrice) * 100;
          priceData[historical.id].usd_7d_change = change;
        }
      }
    });

    return priceData;
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    throw error;
  }
}