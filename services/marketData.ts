
import { MarketIndicesData } from '../types';

// Helper to format large numbers into a more readable format (e.g., 1.23T, 45.6B)
const formatLargeNumber = (num: number): string => {
    if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

async function fetchFearAndGreedIndex() {
    try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        if (!response.ok) {
            throw new Error('Network response for Fear & Greed was not ok');
        }
        const data = await response.json();
        return data.data[0];
    } catch (error) {
        console.error('Failed to fetch Fear & Greed Index:', error);
        return null; // Return null on failure
    }
}

async function fetchCmcGlobalMarketData() {
    try {
        const API_BASE_URL = 'https://api.coinmarketcap.com/data-api/v3';
        const response = await fetch(`${API_BASE_URL}/global-metrics/quotes/latest`);
        if (!response.ok) {
            throw new Error('Network response for global market data was not ok');
        }
        const data = await response.json();
        if (data.status.error_code !== "0") {
            throw new Error(data.status.error_message);
        }
        return data.data;
    } catch (error) {
        console.error('Failed to fetch global market data from CMC:', error);
        throw error;
    }
}


/**
 * Fetches market indices from CoinMarketCap and Alternative.me.
 */
export async function fetchMarketIndices(): Promise<MarketIndicesData> {
    try {
        const [globalData, fearAndGreedData] = await Promise.all([
            fetchCmcGlobalMarketData(),
            fetchFearAndGreedIndex(),
        ]);
        
        // Default structure for fallbacks
        const indices: MarketIndicesData = {
            fear_and_greed: { name: 'Fear & Greed', value: 'N/A', sentiment: 'N/A' },
            btc_dominance: { name: 'BTC Dominance', value: 'N/A' },
            eth_dominance: { name: 'ETH Dominance', value: 'N/A' },
            total_market_cap: { name: 'Total Market Cap', value: 'N/A', change: 0 },
            total_volume_24h: { name: 'Total Volume (24h)', value: 'N/A' },
            active_cryptocurrencies: { name: 'Active Cryptos', value: 'N/A' },
        };

        if (fearAndGreedData) {
            indices.fear_and_greed = {
                name: 'Fear & Greed',
                value: parseInt(fearAndGreedData.value, 10),
                sentiment: fearAndGreedData.value_classification,
            };
        }

        if (globalData) {
            const quote = globalData.quote.USD;
            indices.btc_dominance = {
                name: 'BTC Dominance',
                value: `${globalData.btcDominance.toFixed(2)}%`,
            };
            indices.eth_dominance = {
                name: 'ETH Dominance',
                value: `${globalData.ethDominance.toFixed(2)}%`,
            };
            indices.total_market_cap = {
                name: 'Total Market Cap',
                value: formatLargeNumber(quote.totalMarketCap),
                change: quote.totalMarketCapYesterdayPercentageChange,
            };
            indices.total_volume_24h = {
                name: 'Total Volume (24h)',
                value: formatLargeNumber(quote.totalVolume24h),
            };
            indices.active_cryptocurrencies = {
                name: 'Active Cryptos',
                value: globalData.activeCryptocurrencies.toLocaleString(),
            };
        }

        return indices;

    } catch (error) {
        console.error('Failed to fetch market indices:', error);
        // The UI layer will handle this error and show an appropriate message.
        throw error;
    }
}