
import { MarketIndicesData } from '../types';

/**
 * NOTE: This service simulates fetching data from an API like CoinGlass.
 * The data structures and values are based on the user's provided screenshot
 * to ensure the application displays the intended information accurately.
 */
export async function fetchMarketIndicesFromCoinGlass(): Promise<MarketIndicesData> {
    return Promise.resolve({
        gold_future: {
            name: 'Hợp đồng tương lai Vàng',
            value: '$3362.59',
            change: -0.28,
        },
        dxy: {
            name: 'Chỉ số đồng đô la Mỹ',
            value: '97.782',
            change: 0.19,
        },
        btc_dominance: {
            name: 'Bitcoin Dominance',
            value: '57.19%',
            change: -0.47,
        },
        btc_exchange_balance: {
            name: 'Số Dư Giao Dịch Bitcoin',
            value: '2.24M',
            changeBtc: '+4.46K',
        },
        fear_and_greed: {
            name: 'Chỉ số Sợ hãi và Tham lam',
            value: 46,
            sentiment: 'Trung tính',
        },
        open_interest: {
            name: 'Open Interest',
            value: '18.31B',
            change: -1.16,
        },
        liquidations: {
            name: 'Liquidations',
            value: '20.63M',
            change: -33.70,
        },
        avg_rsi: {
            name: 'AVG RSI',
            value: 44,
            sentiment: 'NEUTRAL',
        },
        altcoin_season_index: {
            name: 'Altcoin Season Index',
            value: 51,
            sentiment: 'NEUTRAL',
        },
    });
}
