import React from 'react';
import { MarketIndicesData } from '../types';

interface AdvancedMarketStatsProps {
    data: MarketIndicesData | null;
    isLoading: boolean;
}

const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg">
        <h4 className="text-sm text-slate-500 dark:text-slate-400 mb-3">{title}</h4>
        {children}
    </div>
);

const LoadingSkeletonCard = () => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
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
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{open_interest.value}</p>
                <p className={`text-sm font-mono mt-1 ${oiChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>{oiChange.toFixed(2)}%</p>
            </StatCard>
            <StatCard title={liquidations.name}>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{liquidations.value}</p>
                <p className={`text-sm font-mono mt-1 ${liqChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>{liqChange.toFixed(2)}%</p>
            </StatCard>
            <StatCard title={avg_rsi.name}>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">{avg_rsi.value}</p>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{avg_rsi.sentiment}</p>
            </StatCard>
            <StatCard title={altcoin_season_index.name}>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{altcoin_season_index.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{altcoin_season_index.sentiment}</p>
            </StatCard>
        </div>
    );
};

export default AdvancedMarketStats;