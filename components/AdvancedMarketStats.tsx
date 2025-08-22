import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { MarketIndicesData } from '../types';

interface AdvancedMarketStatsProps {
    data: MarketIndicesData | null;
    isLoading: boolean;
}

const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex flex-col justify-between min-h-[120px]">
        <h4 className="text-sm text-slate-500 dark:text-slate-400">{title}</h4>
        <div>{children}</div>
    </div>
);

const LoadingSkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md min-h-[120px] animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="flex justify-between items-end">
            <div className="space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
            </div>
            <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
    </div>
);

const Sparkline: React.FC<{ data?: number[]; color: string }> = ({ data, color }) => {
    if (!data || data.length === 0) return <div className="w-24 h-12"></div>;
    const chartData = data.map((value, index) => ({ name: index, value }));
    return (
        <div className="w-24 h-12">
            <ResponsiveContainer>
                <LineChart data={chartData}>
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const RsiGauge: React.FC<{ value: number }> = ({ value }) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const pointerPosition = `${clampedValue}%`;

    return (
        <div className="w-full relative py-2 mt-2 mb-1">
            <div className="h-2.5 flex rounded-full overflow-hidden">
                <div className="w-[20%]" style={{ backgroundColor: '#10b981' }}></div>
                <div className="w-[20%]" style={{ backgroundColor: '#34d399' }}></div>
                <div className="w-[20%]" style={{ backgroundColor: '#94a3b8' }}></div>
                <div className="w-[20%]" style={{ backgroundColor: '#f87171' }}></div>
                <div className="w-[20%]" style={{ backgroundColor: '#ef4444' }}></div>
            </div>
            <div className="absolute top-0 h-full" style={{ left: `calc(${pointerPosition})` }}>
                <div className="w-0 transform -translate-x-1/2">
                    <div
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '7px solid #334155'
                        }}
                        className="dark:border-t-slate-300"
                    ></div>
                </div>
            </div>
        </div>
    );
};

const AltcoinGauge: React.FC<{ value: number }> = ({ value }) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const pointerPosition = `${clampedValue}%`;
    return (
        <div className="w-full relative py-2 mt-3 mb-1">
            <div
                className="h-2.5 rounded-full"
                style={{ background: 'linear-gradient(to right, #f97316, #d946ef, #6366f1)' }}
            ></div>
            <div className="absolute top-0 h-full flex items-center" style={{ left: `calc(${pointerPosition} - 1px)` }}>
                <div className="w-0.5 h-5 bg-slate-900 dark:bg-slate-200"></div>
            </div>
        </div>
    );
};

const AdvancedMarketStats: React.FC<AdvancedMarketStatsProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {Array.from({ length: 4 }).map((_, i) => <LoadingSkeletonCard key={i} />)}
            </div>
        );
    }

    if (!data) return null;
    
    const { open_interest, liquidations, avg_rsi, altcoin_season_index } = data;

    const oiChange = Number(open_interest.change);
    const liqChange = Number(liquidations.change);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <StatCard title={open_interest.name}>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{open_interest.value}</p>
                        <p className={`text-sm font-mono ${oiChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>{oiChange.toFixed(2)}%</p>
                    </div>
                    <Sparkline data={open_interest.sparkline} color={oiChange >= 0 ? '#22c55e' : '#ef4444'} />
                </div>
            </StatCard>
            <StatCard title={liquidations.name}>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{liquidations.value}</p>
                        <p className={`text-sm font-mono ${liqChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>{liqChange.toFixed(2)}%</p>
                    </div>
                    <Sparkline data={liquidations.sparkline} color={liqChange >= 0 ? '#22c55e' : '#ef4444'} />
                </div>
            </StatCard>
            <StatCard title={avg_rsi.name}>
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-lg font-bold text-slate-900 dark:text-white">{avg_rsi.value}</p>
                       <p className="text-sm text-slate-500 dark:text-slate-400">{avg_rsi.sentiment}</p>
                    </div>
                    <div className="w-2/3">
                        <RsiGauge value={Number(avg_rsi.value)} />
                    </div>
                 </div>
            </StatCard>
            <StatCard title={altcoin_season_index.name}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{altcoin_season_index.value}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{altcoin_season_index.sentiment}</p>
                    </div>
                    <div className="w-2/3">
                        <AltcoinGauge value={Number(altcoin_season_index.value)} />
                    </div>
                 </div>
            </StatCard>
        </div>
    );
};

export default AdvancedMarketStats;
