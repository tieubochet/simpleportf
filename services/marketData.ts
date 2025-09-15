
import { MarketIndicesData } from '../types';
import { fetchGlobalMarketData } from './coingecko';

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

/**
 * Fetches market indices from CoinGecko and Alternative.me.
 */
export async function fetchMarketIndices(): Promise<MarketIndicesData> {
    try {
        const [globalData, fearAndGreedData] = await Promise.all([
            fetchGlobalMarketData(),
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
            indices.btc_dominance = {
                name: 'BTC Dominance',
                value: `${globalData.market_cap_percentage.btc.toFixed(2)}%`,
            };
            indices.eth_dominance = {
                name: 'ETH Dominance',
                value: `${globalData.market_cap_percentage.eth.toFixed(2)}%`,
            };
            indices.total_market_cap = {
                name: 'Total Market Cap',
                value: formatLargeNumber(globalData.total_market_cap.usd),
                change: globalData.market_cap_change_percentage_24h_usd,
            };
            indices.total_volume_24h = {
                name: 'Total Volume (24h)',
                value: formatLargeNumber(globalData.total_volume.usd),
            };
            indices.active_cryptocurrencies = {
                name: 'Active Cryptos',
                value: globalData.active_cryptocurrencies.toLocaleString(),
            };
        }

        return indices;

    } catch (error) {
        console.error('Failed to fetch market indices:', error);
        // The UI layer will handle this error and show an appropriate message.
        throw error;
    }
}
