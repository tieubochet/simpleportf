import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PortfolioSnapshot } from '../types';
import type { Theme } from '../hooks/useTheme';

interface PortfolioHistoryChartProps {
    history: PortfolioSnapshot[];
    isPrivacyMode: boolean;
    theme: Theme;
}

type TimeRange = '7D' | '1M' | '3M' | '1Y' | 'ALL';

const CustomTooltipContent = ({ active, payload, label, isPrivacyMode }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.totalValue);
        const date = new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        return (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-600 p-3 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-slate-900 dark:text-white mb-1">{date}</p>
                <p className="text-slate-700 dark:text-slate-300">{isPrivacyMode ? '$ ****' : value}</p>
            </div>
        );
    }
    return null;
};

const PortfolioHistoryChart: React.FC<PortfolioHistoryChartProps> = ({ history, isPrivacyMode, theme }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');

    const filteredData = useMemo(() => {
        if (!history || history.length === 0) return [];
        
        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
            case '7D':
                startDate.setDate(now.getDate() - 7);
                break;
            case '1M':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3M':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '1Y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'ALL':
                return history;
        }
        
        const startTime = startDate.getTime();
        return history.filter(snapshot => new Date(snapshot.date).getTime() >= startTime);
    }, [history, timeRange]);

    const chartColors = useMemo(() => {
        const isDark = theme !== 'light';
        const isDim = theme === 'dim';
        return {
            grid: isDark ? 'rgba(71, 85, 105, 0.3)' : '#e2e8f0',
            tick: isDark ? '#94a3b8' : '#64748b',
            stroke: '#22d3ee', // cyan-400
            gradientFrom: '#22d3ee',
            gradientTo: isDim ? '#334155' : isDark ? '#1e293b' : '#f8fafc',
        };
    }, [theme]);
    
    const timeRangeButtons: TimeRange[] = ['7D', '1M', '3M', '1Y', 'ALL'];
    const activeBtnClasses = "bg-cyan-500 text-white";
    const inactiveBtnClasses = "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300";

    if (filteredData.length < 2) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg h-[400px] flex flex-col justify-center items-center">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Portfolio History</h3>
                <p className="text-slate-500 dark:text-slate-400">Not enough historical data to display a chart. Check back tomorrow!</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-0">Portfolio History</h3>
                <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {timeRangeButtons.map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${timeRange === range ? activeBtnClasses : inactiveBtnClasses}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={filteredData}
                        margin={{ top: 5, right: 20, left: isPrivacyMode ? -10 : 0, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColors.gradientFrom} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={chartColors.gradientTo} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            tick={{ fill: chartColors.tick, fontSize: 12 }}
                            stroke={chartColors.grid}
                        />
                        <YAxis
                            tickFormatter={(val) => isPrivacyMode ? '****' : new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(val)}
                            tick={{ fill: chartColors.tick, fontSize: 12 }}
                            stroke={chartColors.grid}
                            domain={['dataMin', 'dataMax']}
                            width={isPrivacyMode ? 40 : 60}
                        />
                        <Tooltip content={<CustomTooltipContent isPrivacyMode={isPrivacyMode} />} />
                        <Area type="monotone" dataKey="totalValue" stroke={chartColors.stroke} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PortfolioHistoryChart;
