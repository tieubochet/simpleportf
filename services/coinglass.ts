import { MarketIndicesData } from '../types';

/**
 * NOTE: This service simulates fetching data from the CoinGlass API.
 * The data structures and values are based on the expected real-time data
 * from CoinGlass to ensure the application displays accurate information.
 * In a production environment, these would be live fetch() calls to CoinGlass endpoints.
 */

// Simulates fetching data like: Gold Future, US Dollar Index
async function fetchTraditionalMarketData() {
    // Data based on user's "correct" screenshot
    return Promise.resolve({
        gold_future: { value: 3362.59, change: -0.28 },
        dxy: { value: 97.782, change: 0.19 },
    });
}

// Simulates fetching Fear & Greed index
async function fetchFearAndGreedIndex() {
    // Data based on user's "correct" screenshot
    return Promise.resolve({ value: 46, sentiment: 'Trung tính' });
}

// Simulates fetching various crypto market stats
async function fetchCryptoMarketStats() {
    // Data based on user's screenshots
    return Promise.resolve({
        btc_dominance: { value: 57.19, change: -0.47 },
        btc_exchange_balance: { value: '2.24M', change_24h_btc: '+4.46K' },
        open_interest: { value: '18.31B', change: -1.16 },
        liquidations: { value: '20.63M', change: -33.70 },
        avg_rsi: { value: 44, sentiment: 'NEUTRAL' },
        altcoin_season_index: { value: 51, sentiment: 'NEUTRAL' },
    });
}


export async function fetchMarketDataFromCoinGlass(): Promise<MarketIndicesData> {
    // Use Promise.all to simulate fetching all data in parallel
    const [
        tradData,
        fearAndGreed,
        cryptoStats
    ] = await Promise.all([
        fetchTraditionalMarketData(),
        fetchFearAndGreedIndex(),
        fetchCryptoMarketStats()
    ]);

    // Combine data into the structure the app expects, using Vietnamese names from the screenshot
    const marketData: MarketIndicesData = {
        gold_future: {
            name: 'Hợp đồng tương lai Vàng',
            value: `$${tradData.gold_future.value.toFixed(2)}`,
            change: tradData.gold_future.change,
        },
        dxy: {
            name: 'Chỉ số đồng đô la Mỹ',
            value: tradData.dxy.value.toFixed(3),
            change: tradData.dxy.change,
        },
        btc_dominance: {
            name: 'Bitcoin Dominance',
            value: `${cryptoStats.btc_dominance.value.toFixed(2)}%`,
            change: cryptoStats.btc_dominance.change,
        },
        btc_exchange_balance: {
            name: 'Số Dư Giao Dịch Bitcoin',
            value: cryptoStats.btc_exchange_balance.value,
            change_24h_btc: cryptoStats.btc_exchange_balance.change_24h_btc,
        },
        fear_and_greed: {
            name: 'Chỉ số Sợ hãi và Tham lam',
            value: fearAndGreed.value,
            sentiment: fearAndGreed.sentiment,
        },
        open_interest: {
            name: 'Open Interest',
            value: cryptoStats.open_interest.value,
            change: cryptoStats.open_interest.change,
        },
        liquidations: {
            name: 'Liquidations',
            value: cryptoStats.liquidations.value,
            change: cryptoStats.liquidations.change,
        },
        avg_rsi: {
            name: 'AVG RSI',
            value: cryptoStats.avg_rsi.value,
            sentiment: cryptoStats.avg_rsi.sentiment,
        },
        altcoin_season_index: {
            name: 'Altcoin Season Index',
            value: cryptoStats.altcoin_season_index.value,
            sentiment: cryptoStats.altcoin_season_index.sentiment,
        },
    };

    return marketData;
}
