
import { MarketIndicesData } from '../types';

/**
 * NOTE: This service now fetches live data from CoinGlass's new v4 public APIs.
 * If API calls fail, it will return 'N/A' values to avoid showing stale data.
 */

// Helper to format large numbers into a more readable format (e.g., 1.23B, 45.6M, 7.8K)
const formatLargeNumber = (num: number): string => {
    if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(0);
};

// Generic fetch utility to call an API endpoint and handle basic errors.
const fetchJson = async (url: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: { 
                'Accept': 'application/json',
                // v4 API requires this public key header
                'cg-api-key': '2331584558e348938cd4856f712b8429',
                ...options.headers 
            },
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok for ${url}`);
        }
        const json = await response.json();
        if (json.code !== "0" && json.code !== 0) { // API uses both string and number codes
            throw new Error(`API error for ${url}: ${json.msg}`);
        }
        return json.data;
    } catch (error) {
        console.error(error);
        return null; // Return null on failure to avoid crashing the whole batch
    }
};

export async function fetchMarketIndicesFromCoinGlass(): Promise<MarketIndicesData> {
    const API_BASE = 'https://open-api-v4.coinglass.com/api/futures';

    // Fetch all data points concurrently for better performance
    const [
        statisticsData,
        fearGreedData,
        altcoinIndexData,
        btcDominanceData,
        btcBalanceData,
        rsiData
    ] = await Promise.all([
        fetchJson(`${API_BASE}/home/statistics`),
        fetchJson(`${API_BASE}/indicator/fear-greed`),
        fetchJson(`${API_BASE}/indicator/altcoin-season`),
        fetchJson(`${API_BASE}/indicator/dominance-chart`),
        fetchJson(`${API_BASE}/exchange/btc-balance`),
        fetchJson(`${API_BASE}/indicator/rsi?symbol=BTC`)
    ]);

    // --- Transform API data into the required structure ---

    const open_interest = statisticsData ? {
        name: 'Open Interest',
        value: formatLargeNumber(statisticsData.total_open_interest_usd),
        change: statisticsData.total_open_interest_change_24h * 100,
    } : { name: 'Open Interest', value: 'N/A', change: 0 };

    const liquidations = statisticsData ? {
        name: 'Liquidations (24h)',
        value: formatLargeNumber(statisticsData.total_liquidation_usd_24h),
        change: statisticsData.total_liquidation_change_24h * 100,
    } : { name: 'Liquidations (24h)', value: 'N/A', change: 0 };

    const fear_and_greed = (fearGreedData && fearGreedData.length > 0) ? {
        name: 'Fear & Greed Index',
        value: parseInt(fearGreedData[0].value, 10),
        sentiment: fearGreedData[0].value_classification,
    } : { name: 'Fear & Greed Index', value: 0, sentiment: 'N/A' };

    const altcoin_season_index = (altcoinIndexData && altcoinIndexData.length > 0) ? {
        name: 'Altcoin Season Index',
        value: parseInt(altcoinIndexData[0].value, 10),
        sentiment: altcoinIndexData[0].value_classification.toUpperCase().replace('SEASON', ' SEASON'),
    } : { name: 'Altcoin Season Index', value: 0, sentiment: 'N/A' };

    const btc_dominance = (btcDominanceData && btcDominanceData.data_list.length > 1) ? {
        name: 'Bitcoin Dominance',
        value: `${btcDominanceData.data_list[btcDominanceData.data_list.length - 1].toFixed(2)}%`,
        change: ((btcDominanceData.data_list[btcDominanceData.data_list.length - 1] - btcDominanceData.data_list[btcDominanceData.data_list.length - 2]) / btcDominanceData.data_list[btcDominanceData.data_list.length - 2]) * 100,
    } : { name: 'Bitcoin Dominance', value: 'N/A', change: 0 };
    
    const btc_exchange_balance = (btcBalanceData && btcBalanceData.balance_list.length > 0) ? {
        name: 'BTC Exchange Balance',
        value: formatLargeNumber(btcBalanceData.balance_list[btcBalanceData.balance_list.length - 1].balance),
        changeBtc: `${btcBalanceData.balance_list[btcBalanceData.balance_list.length - 1].change_24h > 0 ? '+' : ''}${formatLargeNumber(btcBalanceData.balance_list[btcBalanceData.balance_list.length - 1].change_24h)}`,
    } : { name: 'BTC Exchange Balance', value: 'N/A', changeBtc: '0' };
    
    const rsiList = rsiData?.data;
    const avg_rsi = (rsiList && rsiList.length > 0) ? {
        name: 'BTC RSI (1D)',
        value: Math.round(rsiList[rsiList.length - 1].value),
        sentiment: rsiList[rsiList.length - 1].value > 70 ? 'OVERBOUGHT' : rsiList[rsiList.length - 1].value < 30 ? 'OVERSOLD' : 'NEUTRAL',
    } : { name: 'BTC RSI (1D)', value: 0, sentiment: 'N/A' };

    // Combine live data with static fallbacks for a complete object
    return {
        btc_dominance,
        btc_exchange_balance,
        fear_and_greed,
        open_interest,
        liquidations,
        avg_rsi,
        altcoin_season_index,
    };
}