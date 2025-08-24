import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PortfolioSnapshot } from '../types';
import type { Theme } from '../hooks/useTheme';

interface PortfolioHistoryChartProps {
    history: PortfolioSnapshot[];
    isPrivacyMode: boolean;
    theme: Theme;
}

type TimeRange = '7D' | '1M' | '3M' | '1Y' | 'ALL';
type ChartType = 'value' | 'pl';

const CustomTooltipContent = ({ active, payload, label, isPrivacyMode, chartType }: any) => {
    if (active && payload && payload.length) {
        const dataKey = chartType === 'pl' ? 'totalUnrealizedPL' : 'totalValue';
        const value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].payload[dataKey]);
        const date = new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const title = chartType === 'pl' ? 'Unrealized P/L' : 'Portfolio Value';

        return (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-600 p-3 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-slate-900 dark:text-white mb-1">{date}</p>
                 <p className="text-slate-500 dark:text-slate-400 text-xs">{title}</p>
                <p className="text-slate-700 dark:text-slate-300">{isPrivacyMode ? '$ ****' : value}</p>
            </div>
        );
    }
    return null;
};

const PortfolioHistoryChart: React.FC<PortfolioHistoryChartProps> = ({ history, isPrivacyMode, theme }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');
    const [chartType, setChartType] = useState<ChartType>('value');

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

    const chartDisplayConfig = useMemo(() => {
        const isPL = chartType === 'pl';
        const lastDataPoint = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;
        const isPositivePL = lastDataPoint ? lastDataPoint.totalUnrealizedPL >= 0 : true;

        const mainColor = isPL ? (isPositivePL ? '#22c55e' : '#ef4444') : '#22d3ee';
        
        const isDark = theme !== 'light';
        const isDim = theme === 'dim';

        return {
            dataKey: isPL ? 'totalUnrealizedPL' : 'totalValue',
            title: isPL ? 'P/L Performance' : 'Portfolio Value',
            gradientId: isPL ? (isPositivePL ? 'plGradientPositive' : 'plGradientNegative') : 'valueGradient',
            gridColor: isDark ? 'rgba(71, 85, 105, 0.3)' : '#e2e8f0',
            tickColor: isDark ? '#94a3b8' : '#64748b',
            strokeColor: mainColor,
            gradientFrom: mainColor,
            gradientTo: isDim ? '#334155' : isDark ? '#1e293b' : '#f8fafc',
        };
    }, [chartType, filteredData, theme]);
    
    const timeRangeButtons: TimeRange[] = ['7D', '1M', '3M', '1Y', 'ALL'];
    const activeBtnClasses = "bg-cyan-500 text-white";
    const inactiveBtnClasses = "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300";

    if (history.length < 2) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg h-[400px] flex flex-col justify-center items-center">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Portfolio History</h3>
                <p className="text-slate-500 dark:text-slate-400">Not enough historical data to display a chart. Check back tomorrow!</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{chartDisplayConfig.title}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button onClick={() => setChartType('value')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartType === 'value' ? activeBtnClasses : inactiveBtnClasses}`}>Value</button>
                        <button onClick={() => setChartType('pl')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartType === 'pl' ? activeBtnClasses : inactiveBtnClasses}`}>P/L</button>
                    </div>
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
            </div>
            <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={filteredData}
                        margin={{ top: 5, right: 20, left: isPrivacyMode ? -10 : 0, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id={chartDisplayConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartDisplayConfig.gradientFrom} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={chartDisplayConfig.gradientTo} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartDisplayConfig.gridColor} />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            tick={{ fill: chartDisplayConfig.tickColor, fontSize: 12 }}
                            stroke={chartDisplayConfig.gridColor}
                        />
                        <YAxis
                            tickFormatter={(val) => isPrivacyMode ? '****' : new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(val)}
                            tick={{ fill: chartDisplayConfig.tickColor, fontSize: 12 }}
                            stroke={chartDisplayConfig.gridColor}
                            domain={chartType === 'pl' ? [dataMin => Math.min(dataMin, 0), dataMax => Math.max(dataMax, 0)] : ['dataMin', 'dataMax']}
                            width={isPrivacyMode ? 40 : 60}
                        />
                         {chartType === 'pl' && <ReferenceLine y={0} stroke={chartDisplayConfig.gridColor} strokeDasharray="3 3" />}
                        <Tooltip content={<CustomTooltipContent isPrivacyMode={isPrivacyMode} chartType={chartType} />} />
                        <Area type="monotone" dataKey={chartDisplayConfig.dataKey} stroke={chartDisplayConfig.strokeColor} strokeWidth={2} fillOpacity={1} fill={`url(#${chartDisplayConfig.gradientId})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PortfolioHistoryChart;