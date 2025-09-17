import { GlobalStatsData } from '../types';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetches the current fast ETH gas price from ethgas.watch.
 * @returns A promise that resolves to the gas price in Gwei, or 0 on error.
 */
async function fetchEthGasPriceGwei(): Promise<number> {
    try {
        const response = await fetch('https://ethgas.watch/api/gas/latest');
        if (!response.ok) {
            throw new Error('Network response for ETH gas was not ok');
        }
        const data = await response.json();
        if (data && typeof data.price === 'number') {
            return data.price;
        }
        throw new Error('Invalid data structure from ethgas.watch API');
    } catch (error) {
        console.error('Failed to fetch ETH gas price:', error);
        return 0;
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
