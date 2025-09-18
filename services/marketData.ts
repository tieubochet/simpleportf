import { GlobalStatsData } from '../types';
import { ethers } from 'https://esm.sh/ethers@6.13.1';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetches the current ETH gas price in Gwei by querying a pool of public RPC endpoints for reliability.
 * @returns A promise that resolves to the gas price in Gwei.
 */
async function fetchEthGasPriceGwei(): Promise<number> {
    try {
        // Create a list of reliable public RPC providers for redundancy.
        const providers = [
            new ethers.JsonRpcProvider('https://cloudflare-eth.com'),
            new ethers.JsonRpcProvider('https://rpc.ankr.com/eth'),
            new ethers.JsonRpcProvider('https://eth-mainnet.public.blastapi.io'),
        ];
        
        // The FallbackProvider will query each provider in order until one returns a result.
        const fallbackProvider = new ethers.FallbackProvider(providers);

        const feeData = await fallbackProvider.getFeeData();
        
        if (feeData.gasPrice) {
            const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');
            return parseFloat(gasPriceGwei);
        }
        return 0;
    } catch (error) {
        console.warn("Could not fetch ETH gas price from any RPC provider:", error);
        return 0; // Return 0 on failure
    }
}


/**
 * Fetches global cryptocurrency market statistics from CoinGecko and ETH gas price.
 * @returns A promise that resolves to an object containing global market data.
 */
export async function fetchGlobalMarketStats(): Promise<GlobalStatsData> {
    try {
        const [globalRes, gasPriceRes] = await Promise.allSettled([
            fetch(`${API_BASE_URL}/global`),
            fetchEthGasPriceGwei()
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
        if (gasPriceRes.status === 'fulfilled' && typeof gasPriceRes.value === 'number') {
           gasPriceGwei = gasPriceRes.value;
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