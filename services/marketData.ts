import { MarketIndicesData, GroundingSource } from '../types';
import { fetchMarketDataFromGemini } from './gemini';
import { fetchMarketIndicesFromCoinGlass } from './coinglass';

/**
 * Fetches comprehensive market indices.
 * It prioritizes Gemini for its real-time, search-grounded data, ensuring the most current information.
 * If the primary source is unavailable, it seamlessly falls back to CoinGlass to maintain data availability.
 * @returns A promise that resolves to an object containing market data and a list of sources.
 */
export async function fetchMarketIndices(): Promise<{ data: MarketIndicesData; sources: GroundingSource[] }> {
    try {
        const geminiResult = await fetchMarketDataFromGemini();
        // Basic validation to ensure the primary data source returned valid information.
        if (geminiResult.data && geminiResult.data.btc_dominance?.value) {
            return geminiResult;
        }
        // If validation fails, trigger the fallback mechanism.
        throw new Error("Gemini data is invalid or incomplete.");
    } catch (error) {
        console.warn("Primary market data source (Gemini) failed. Using fallback (CoinGlass).", error);
        try {
            const coinglassData = await fetchMarketIndicesFromCoinGlass();
            // The fallback source does not provide grounding sources, so return an empty array.
            return { data: coinglassData, sources: [] };
        } catch (fallbackError) {
            console.error("Fallback market data source (CoinGlass) also failed.", fallbackError);
            throw new Error("Both primary and fallback market data sources have failed.");
        }
    }
}


// The functions below are no longer used as we are switching to a more advanced data source.
// They are kept here for historical reference but are not exported or used in the app.

async function fetchGlobalFromCoinGecko() {
    try {
        const response = await fetch('https://api.coingcko.com/api/v3/global');
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
        const response = await fetch('https://ethgas.watch/api/gas');
        if (!response.ok) {
            throw new Error('Network response for ETH gas was not ok');
        }
        const data = await response.json();
        if (data && data.fast && typeof data.fast.gwei === 'number') {
            return data.fast.gwei;
        }
        throw new Error('Invalid data structure from ethgas.watch API');
    } catch (error) {
        console.error('Failed to fetch ETH gas price:', error);
        return 0;
    }
}
