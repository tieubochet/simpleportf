import { GlobalStatsData } from '../types';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetches the current fast ETH gas price from ethgastracker.com.
 * @returns A promise that resolves to the gas price in Gwei, or 0 on error.
 */
async function fetchEthGasPriceGwei(): Promise<number> {
    try {
        const response = await fetch('https://www.ethgastracker.com/api/gas/latest');
        if (!response.ok) {
            throw new Error('Network response for ETH gas was not ok');
        }
        const data = await response.json();
        // The API returns a nested object: { data: { oracle: { fast: { gwei: ... } } } }
        if (data && data.data && data.data.oracle && data.data.oracle.fast && typeof data.data.oracle.fast.gwei === 'number') {
            return data.data.oracle.fast.gwei;
        }
        throw new Error('Invalid data structure from ethgastracker gas API');
    } catch (error) {
        console.error('Failed to fetch ETH gas price:', error);
        return 0; // Return 0 as a fallback on any error.
    }
}

/**
 * Fetches global cryptocurrency market statistics from CoinGecko.
 * @returns A promise that resolves to an object containing global market data.
 */
export async function fetchGlobalMarketStats(): Promise<GlobalStatsData> {
    try {
        const [globalRes, gasPrice] = await Promise.all([
            fetch(`${API_BASE_URL}/global`),
            fetchEthGasPriceGwei()
        ]);
        
        if (!globalRes.ok) {
            throw new Error('Network response for global stats was not ok');
        }
        
        const globalData = await globalRes.json();
        const { data } = globalData;

        if (!data) {
             throw new Error('Invalid data structure from CoinGecko global API');
        }

        return {
            active_cryptocurrencies: data.active_cryptocurrencies,
            markets: data.markets,
            total_market_cap: data.total_market_cap.usd,
            market_cap_change_percentage_24h_usd: data.market_cap_change_percentage_24h_usd,
            total_volume_24h: data.total_volume.usd,
            btc_dominance: data.market_cap_percentage.btc,
            eth_dominance: data.market_cap_percentage.eth,
            eth_gas_price_gwei: gasPrice,
        };

    } catch (error) {
        console.error('Failed to fetch global market stats:', error);
        throw error;
    }
}