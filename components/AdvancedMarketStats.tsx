
import React from 'react';
import { MarketIndicesData } from '../types';

interface AdvancedMarketStatsProps {
    data: MarketIndicesData | null;
    isLoading: boolean;
}

const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
        <h4 className="text-sm text-slate-500 dark:text-slate-400 mb-2">{title}</h4>
        {children}
    </div>
);

const LoadingSkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3"></div>
        <div className="space-y-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
    </div>
);

const AdvancedMarketStats: React.FC<AdvancedMarketStatsProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <LoadingSkeletonCard key={i} />)}
            </div>
        );
    }

    if (!data) return null;
    
    const { open_interest, liquidations, avg_rsi, altcoin_season_index } = data;

    const oiChange = Number(open_interest.change);
    const liqChange = Number(liquidations.change);

    return (
        <div className="grid grid-cols-1 gap-4">
            <StatCard title={open_interest.name}>
                <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{open_interest.value}</p>
                    <p className={`text-sm font-mono ${oiChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>{oiChange.toFixed(2)}%</p>
                </div>
            </StatCard>
            <StatCard title={liquidations.name}>
                <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{liquidations.value}</p>
                    <p className={`text-sm font-mono ${liqChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>{liqChange.toFixed(2)}%</p>
                </div>
            </StatCard>
            <StatCard title={avg_rsi.name}>
                 <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{avg_rsi.value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{avg_rsi.sentiment}</p>
                 </div>
            </StatCard>
            <StatCard title={altcoin_season_index.name}>
                <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{altcoin_season_index.value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{altcoin_season_index.sentiment}</p>
                </div>
            </StatCard>
        </div>
    );
};

export default AdvancedMarketStats;
