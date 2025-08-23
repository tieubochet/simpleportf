import { MarketIndicesData } from '../types';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';
const FNG_API_BASE_URL = 'https://api.alternative.me';

// Helper to generate some fake sparkline data
const generateSparkline = () => {
  return Array.from({ length: 20 }, () => Math.random() * 100);
};

export async function fetchMarketIndices(): Promise<MarketIndicesData> {
  try {
    const [globalDataRes, fngDataRes] = await Promise.all([
      fetch(`${COINGECKO_API_BASE_URL}/global`),
      fetch(`${FNG_API_BASE_URL}/fng/?limit=1`)
    ]);

    if (!globalDataRes.ok) {
        throw new Error('Failed to fetch CoinGecko global data');
    }
    if (!fngDataRes.ok) {
        throw new Error('Failed to fetch Fear & Greed Index');
    }

    const globalData = await globalDataRes.json();
    const fngData = await fngDataRes.json();

    const btcDominance = globalData?.data?.market_cap_percentage?.btc?.toFixed(2) ?? 'N/A';
    const btcDominanceChange = globalData?.data?.market_cap_change_percentage_24h_usd?.toFixed(2) ?? 0;

    const fngValue = fngData?.data?.[0]?.value ?? 'N/A';
    const fngSentiment = fngData?.data?.[0]?.value_classification ?? 'N/A';

    // Mock data for indices not readily available from a single free API
    const mockData = {
      gold_future: { name: 'Gold Future', value: '$2334.30', change: -0.13 },
      dxy: { name: 'US Dollar Index', value: '105.572', change: 0.06 },
      btc_exchange_balance: { name: 'BTC Exchange Balance', value: '2.33M', change_24h_btc: '-1.86K' },
      open_interest: { name: 'Open Interest', value: '18.31B', change: -1.16, sparkline: generateSparkline() },
      liquidations: { name: 'Liquidations', value: '20.63M', change: -33.7, sparkline: generateSparkline() },
      avg_rsi: { name: 'AVG RSI', value: 44, sentiment: 'NEUTRAL' },
      altcoin_season_index: { name: 'Altcoin Season Index', value: 51, sentiment: 'NEUTRAL' },
    };

    return {
      ...mockData,
      btc_dominance: { name: 'Bitcoin Dominance', value: `${btcDominance}%`, change: btcDominanceChange },
      fear_and_greed: { name: 'Fear & Greed Index', value: fngValue, sentiment: fngSentiment },
    };

  } catch (error) {
    console.error('Failed to fetch market indices:', error);
    // Return a default/error state object so the UI doesn't completely break
     return {
        gold_future: { name: 'Gold Future', value: 'N/A', change: 0 },
        dxy: { name: 'US Dollar Index', value: 'N/A', change: 0 },
        btc_dominance: { name: 'Bitcoin Dominance', value: 'N/A', change: 0 },
        btc_exchange_balance: { name: 'BTC Exchange Balance', value: 'N/A', change_24h_btc: '0' },
        fear_and_greed: { name: 'Fear & Greed Index', value: 'N/A', sentiment: 'N/A' },
        open_interest: { name: 'Open Interest', value: 'N/A', change: 0, sparkline: [] },
        liquidations: { name: 'Liquidations', value: 'N/A', change: 0, sparkline: [] },
        avg_rsi: { name: 'AVG RSI', value: 0, sentiment: 'N/A' },
        altcoin_season_index: { name: 'Altcoin Season Index', value: 0, sentiment: 'N/A' },
    };
  }
}