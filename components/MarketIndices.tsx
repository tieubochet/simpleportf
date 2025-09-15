
import React from 'react';
import { GlobalStatsData } from '../types';
import { BoltIcon } from './icons';

// Helper to format numbers with commas
const formatSimpleNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
};

// Helper to format large currency values
const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

// Renders a single stat item
const StatItem: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="mt-1 text-xl font-semibold text-slate-900 dark:text-white tracking-tight">{value}</dd>
    </div>
);

// A skeleton loader to show while data is fetching.
const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-32 mt-2"></div>
            </div>
        ))}
    </div>
);

const GlobalStatsBar: React.FC<{ data: GlobalStatsData | null; isLoading: boolean }> = ({ data, isLoading }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex-shrink-0">Market Snapshot</h2>
            <div className="flex-grow">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : !data ? (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                        Could not load market data.
                    </div>
                ) : (
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <StatItem label="Market Cap" value={
                            <div className="flex items-baseline space-x-2">
                                <span>{formatCurrency(data.total_market_cap)}</span>
                                <span className={`text-sm font-mono ${data.market_cap_change_percentage_24h_usd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {data.market_cap_change_percentage_24h_usd.toFixed(2)}%
                                </span>
                            </div>
                        } />
                        <StatItem label="24h Volume" value={formatCurrency(data.total_volume_24h)} />
                        <StatItem label="Coins" value={formatSimpleNumber(data.active_cryptocurrencies)} />
                        <StatItem label="Exchanges" value={formatSimpleNumber(data.markets)} />
                        <StatItem label="Dominance" value={
                            <div className="flex items-baseline space-x-3 text-lg">
                                <span title="Bitcoin Dominance">BTC {data.btc_dominance.toFixed(1)}%</span>
                                <span className="text-slate-400 dark:text-slate-500">/</span>
                                <span title="Ethereum Dominance">ETH {data.eth_dominance.toFixed(1)}%</span>
                            </div>
                        } />
                        <StatItem label="ETH Gas" value={
                           <div className="flex items-center space-x-1.5">
                                <BoltIcon className="h-5 w-5 text-cyan-400" />
                                <span>{data.eth_gas_price_gwei.toFixed(1)} GWEI</span>
                           </div>
                        } />
                    </dl>
                )}
            </div>
        </div>
    );
};

export default GlobalStatsBar;