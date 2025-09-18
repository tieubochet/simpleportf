import { GlobalStatsData } from '../types';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetches global cryptocurrency market statistics from CoinGecko and ETH gas price from DeFiLlama.
 * @returns A promise that resolves to an object containing global market data.
 */
export async function fetchGlobalMarketStats(): Promise<GlobalStatsData> {
    try {
        const [globalRes, gasPriceRes] = await Promise.allSettled([
            fetch(`${API_BASE_URL}/global`),
            fetch('https://fees.defillama.com/gas')
        ]);
        
        if (globalRes.status !== 'fulfilled' || !globalRes.value.ok) {
             throw new Error('Network response for global stats was not ok');
        }

        const globalData = await globalRes.value.json();
        const { data } = globalData;

        if (!data) {
             throw new Error('Invalid data structure from CoinGecko global API');
        }
        
        let gasPriceGwei = 0; // Default value
        if (gasPriceRes.status === 'fulfilled' && gasPriceRes.value.ok) {
            const gasData = await gasPriceRes.value.json();
            const price = gasData?.ethereum?.gasPrice;
            if (typeof price === 'number') {
                gasPriceGwei = price;
            }
        } else {
            console.warn("Failed to fetch ETH gas price, defaulting to 0.");
        }

        return {
            active_cryptocurrencies: data.active_cryptocurrencies,
            markets: data.markets,
            total_market_cap: data.total_market_cap.usd,
            market_cap_change_percentage_24h_usd: data.market_cap_change_percentage_24h_usd,
            total_volume_24h: data.total_volume.usd,
            btc_dominance: data.market_cap_percentage.btc,
            eth_dominance: data.market_cap_percentage.eth,
            eth_gas_price_gwei: gasPriceGwei,
        };

    } catch (error) {
        console.error('Failed to fetch global market stats:', error);
        throw error;
    }
}