import { GlobalStatsData } from '../types';

async function fetchGlobalFromCoinGecko() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/global');
        if (!response.ok) {
            throw new Error('Network response for CoinGecko global data was not ok');
        }
        const data = await response.json();
        if (!data || !data.data) {
            throw new Error('Invalid data structure from CoinGecko global API');
        }
        return data.data;
    } catch (error) {
        console.error('Failed to fetch global market data from CoinGecko:', error);
        throw error;
    }
}

async function fetchEthGasPrice() {
    try {
        // Using a reliable public API for gas prices
        const response = await fetch('https://ethgas.watch/api/gas');
        if (!response.ok) {
            throw new Error('Network response for ETH gas was not ok');
        }
        const data = await response.json();
        // Add validation to ensure the expected data structure exists
        if (data && data.fast && typeof data.fast.gwei === 'number') {
            return data.fast.gwei; // Use the "fast" gas price
        }
        throw new Error('Invalid data structure from ethgas.watch API');
    } catch (error) {
        console.error('Failed to fetch ETH gas price:', error);
        return 0; // Return 0 on failure so the app doesn't crash
    }
}


/**
 * Fetches global market stats from CoinGecko and ETH gas price.
 */
export async function fetchGlobalStats(): Promise<GlobalStatsData> {
    try {
        const [globalData, gasPrice] = await Promise.all([
            fetchGlobalFromCoinGecko(),
            fetchEthGasPrice(),
        ]);
        
        if (!globalData) {
            throw new Error("Failed to get global data from CoinGecko.");
        }

        // Safely access nested properties with nullish coalescing to prevent runtime errors
        const stats: GlobalStatsData = {
            active_cryptocurrencies: globalData.active_cryptocurrencies ?? 0,
            markets: globalData.markets ?? 0,
            total_market_cap: globalData.total_market_cap?.usd ?? 0,
            market_cap_change_percentage_24h_usd: globalData.market_cap_change_percentage_24h_usd ?? 0,
            total_volume_24h: globalData.total_volume?.usd ?? 0,
            btc_dominance: globalData.market_cap_percentage?.btc ?? 0,
            eth_dominance: globalData.market_cap_percentage?.eth ?? 0,
            eth_gas_price_gwei: gasPrice,
        };

        return stats;

    } catch (error) {
        console.error('Failed to fetch global market stats:', error);
        throw error;
    }
}