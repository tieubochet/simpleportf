import { MarketIndicesData, GroundingSource, SimpleValueIndex } from '../types';
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

/**
 * Fetches the current fast ETH gas price from ethgas.watch.
 * @returns A promise that resolves to an object with the gas price, or a fallback on error.
 */
export async function fetchEthGasPrice(): Promise<SimpleValueIndex> {
    try {
        // Using 'latest' endpoint as per current API, correcting typo from user's 'lastest'.
        const response = await fetch('https://ethgas.watch/api/gas/latest');
        if (!response.ok) {
            throw new Error('Network response for ETH gas was not ok');
        }
        const data = await response.json();
        // The new API structure returns a 'price' field.
        if (data && typeof data.price === 'number') {
            return {
                name: 'ETH Gas (Fast)',
                value: `${Math.round(data.price)} Gwei`,
            };
        }
        throw new Error('Invalid data structure from ethgas.watch API');
    } catch (error) {
        console.error('Failed to fetch ETH gas price:', error);
        // Return a fallback value to prevent UI breakage
        return { name: 'ETH Gas (Fast)', value: 'N/A' };
    }
}
