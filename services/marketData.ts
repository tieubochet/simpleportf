import { GlobalStatsData } from '../types';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';
const ETHERSCAN_API_BASE_URL = 'https://api.etherscan.io/v2/api';

/**
 * Fetches the current ETH gas price in Gwei from the Etherscan API.
 * @returns A promise that resolves to the "Fast" gas price in Gwei.
 */
export async function fetchEtherscanGasPriceGwei(): Promise<number> {
    try {
        // Use import.meta.env for Vite-based environments (like Vercel) to correctly access the API key.
        // The user must set ETHERSCAN_API in their deployment environment.
        const apiKey = (import.meta as any).env?.ETHERSCAN_API;
        if (!apiKey) {
            console.warn("Etherscan API key (ETHERSCAN_API) is not configured.");
            return 0;
        }

        const response = await fetch(`${ETHERSCAN_API_BASE_URL}?chainid=1&module=gastracker&action=gasoracle&apikey=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`Etherscan API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "1" && data.result && data.result.FastGasPrice) {
            return parseFloat(data.result.FastGasPrice);
        } else {
            console.warn("Etherscan API did not return a valid gas price:", data.message || data.result);
            return 0;
        }
    } catch (error) {
        console.error("Could not fetch ETH gas price from Etherscan:", error);
        return 0; // Return 0 on failure
    }
}


/**
 * Fetches global cryptocurrency market statistics from CoinGecko.
 * @returns A promise that resolves to an object containing global market data, excluding gas price.
 */
export async function fetchGlobalMarketStats(): Promise<Omit<GlobalStatsData, 'eth_gas_price_gwei'>> {
    try {
        const response = await fetch(`${COINGECKO_API_BASE_URL}/global`);
        
        if (!response.ok) {
             throw new Error('Network response for global stats was not ok');
        }

        const globalData = await response.json();
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
        };

    } catch (error) {
        console.error('Failed to fetch global market stats:', error);
        throw error;
    }
}
