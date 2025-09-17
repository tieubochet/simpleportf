
import React from 'react';
import { MarketIndicesData, GroundingSource, MarketIndex, GaugeIndex, BtcBalanceIndex } from '../types';

const StatCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg h-full">
        {children}
    </div>
);

const GaugeStat: React.FC<{ stat: GaugeIndex }> = ({ stat }) => {
    const { name, value, sentiment } = stat;
    const pointerPosition = `${value}%`;

    const getGaugeGradient = (type: string) => {
        if (type.includes('Fear')) return 'from-red-500 via-yellow-400 to-green-500';
        if (type.includes('Season')) return 'from-cyan-400 to-purple-500';
        if (type.includes('RSI')) return 'from-teal-500 via-slate-400 to-red-500';
        return 'from-slate-400 to-slate-600';
    };

    return (
        <StatCard>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={name}>{name}</p>
            <div className="flex items-baseline space-x-2 mt-1">
                <p className="text-2xl font-semibold text-slate-800 dark:text-white">{value}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{sentiment}</p>
            </div>
            <div className="relative mt-3 mb-1 h-2 w-full">
                <div className={`h-full rounded-full bg-gradient-to-r ${getGaugeGradient(name)}`}></div>
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-0.5 bg-slate-800 dark:bg-slate-200 rounded-full"
                    style={{ left: `calc(${pointerPosition} - 1px)` }}
                    title={`Index: ${value}`}
                ></div>
            </div>
        </StatCard>
    );
};

const ValueChangeStat: React.FC<{ stat: MarketIndex }> = ({ stat }) => {
    const { name, value, change } = stat;
    const isPositive = change >= 0;

    return (
        <StatCard>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={name}>{name}</p>
            <p className="text-2xl font-semibold text-slate-800 dark:text-white mt-1">{value}</p>
            <p className={`text-sm font-mono mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
            </p>
        </StatCard>
    );
};

const BtcBalanceStat: React.FC<{ stat: BtcBalanceIndex }> = ({ stat }) => {
    const { name, value, changeBtc } = stat;
    const isPositive = changeBtc.startsWith('+');

    return (
        <StatCard>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={name}>{name}</p>
            <p className="text-2xl font-semibold text-slate-800 dark:text-white mt-1">{value}</p>
            <p className={`text-sm font-mono mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {changeBtc}
            </p>
        </StatCard>
    );
};


const LoadingSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-full">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-2"></div>
                </div>
            ))}
        </div>
    </div>
);


const MarketIndices: React.FC<{ data: MarketIndicesData | null; sources: GroundingSource[]; isLoading: boolean }> = ({ data, sources, isLoading }) => {
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!data) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Market Snapshot</h2>
                <p className="text-center text-slate-500 dark:text-slate-400">Could not load real-time market data.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Market Snapshot</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
                <GaugeStat stat={data.fear_and_greed} />
                <ValueChangeStat stat={data.open_interest} />
                <ValueChangeStat stat={data.liquidations} />
                <GaugeStat stat={data.altcoin_season_index} />
                <BtcBalanceStat stat={data.btc_exchange_balance} />
                <GaugeStat stat={data.avg_rsi} />
            </div>
            {sources.length > 0 && (
                <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        Data Sources (via Google Search)
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4">
                        {sources.slice(0, 4).map((source, index) => (
                             <a 
                                key={index} 
                                href={source.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-colors truncate" 
                                title={source.web.title}
                            >
                                {new URL(source.web.uri).hostname}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketIndices;
