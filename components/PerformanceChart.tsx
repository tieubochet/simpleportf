import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HistoricalDataPoint } from '../types';

type TimeRange = '24h' | '7d' | '30d' | '1y';
type Theme = 'light' | 'dark';

interface PerformanceChartProps {
  portfolioData: HistoricalDataPoint[];
  btcData: HistoricalDataPoint[];
  isLoading: boolean;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  isPrivacyMode: boolean;
  theme: Theme;
}

const formatDate = (tickItem: number, range: TimeRange) => {
    const date = new Date(tickItem);
    switch (range) {
        case '24h':
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
        case '7d':
        case '30d':
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case '1y':
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        default:
            return date.toLocaleDateString('en-US');
    }
};

const CustomTooltip = ({ active, payload, label, isPrivacyMode }: any) => {
  if (active && payload && payload.length) {
    const portfolio = payload.find(p => p.dataKey === 'portfolioValue');
    const btc = payload.find(p => p.dataKey === 'btcPrice');

    return (
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-600 p-3 rounded-lg shadow-lg text-sm">
        <p className="font-bold mb-2 text-slate-900 dark:text-white">{new Date(label).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        {btc && <p style={{ color: '#f97316' }}>BTC Price: {isPrivacyMode ? '$ ****' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(btc.value)}</p>}
        {portfolio && <p style={{ color: '#60a5fa' }}>Portfolio Value: {isPrivacyMode ? '$ ****' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(portfolio.value)}</p>}
      </div>
    );
  }
  return null;
};

const LoadingSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md min-h-[440px] animate-pulse">
        <div className="flex justify-between items-center mb-6">
            <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="flex space-x-2">
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            </div>
        </div>
        <div className="h-[350px] w-full bg-slate-200 dark:bg-slate-700 rounded-md"></div>
    </div>
);

const TimeRangeButton: React.FC<{ label: string; range: TimeRange; activeRange: string; onClick: (range: TimeRange) => void }> = ({ label, range, activeRange, onClick }) => {
    const isActive = range === activeRange;
    return (
        <button
            onClick={() => onClick(range)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${
                isActive
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
        >
            {label}
        </button>
    )
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ portfolioData, btcData, isLoading, timeRange, setTimeRange, isPrivacyMode, theme }) => {
    const hasBtcData = useMemo(() => btcData && btcData.length >= 2, [btcData]);

    const chartData = useMemo(() => {
        if (!portfolioData || portfolioData.length < 2) {
            return [];
        }

        if (!hasBtcData) {
            return portfolioData.map(d => ({
                timestamp: d[0],
                portfolioValue: d[1],
            }));
        }

        // Both are available: run alignment logic
        const portfolioMap = new Map(portfolioData);
        const btcMap = new Map(btcData);

        const allTimestamps = new Set([...portfolioData.map(p => p[0]), ...btcData.map(p => p[0])]);
        const unifiedTimeline = Array.from(allTimestamps).sort((a, b) => a - b);

        let lastPortfolioValue = portfolioData[0][1];
        let lastBtcValue = btcData[0][1];
        
        const firstPortfolioTime = portfolioData[0][0];
        const firstBtcTime = btcData[0][0];
        const startTime = Math.max(firstPortfolioTime, firstBtcTime);

        const alignedData = unifiedTimeline
            .filter(ts => ts >= startTime)
            .map(timestamp => {
                lastPortfolioValue = portfolioMap.get(timestamp) ?? lastPortfolioValue;
                lastBtcValue = btcMap.get(timestamp) ?? lastBtcValue;
                return {
                    timestamp,
                    portfolioValue: lastPortfolioValue,
                    btcValue: lastBtcValue,
                };
            });

        if (alignedData.length < 2) return [];

        return alignedData.map(d => ({
            timestamp: d.timestamp,
            portfolioValue: d.portfolioValue,
            btcPrice: d.btcValue, // Use raw BTC price
        }));

    }, [portfolioData, btcData, hasBtcData]);
    
    const chartColors = {
        grid: theme === 'dark' ? '#334155' : '#e2e8f0',
        tick: theme === 'dark' ? '#94a3b8' : '#64748b',
        legend: theme === 'dark' ? '#cbd5e1' : '#334155',
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }
    
    const hasData = chartData.length > 0;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md min-h-[440px] flex flex-col">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 sm:mb-0">Performance</h3>
                <div className="flex items-center space-x-2">
                    <TimeRangeButton label="24H" range="24h" activeRange={timeRange} onClick={setTimeRange} />
                    <TimeRangeButton label="7D" range="7d" activeRange={timeRange} onClick={setTimeRange} />
                    <TimeRangeButton label="30D" range="30d" activeRange={timeRange} onClick={setTimeRange} />
                    <TimeRangeButton label="1Y" range="1y" activeRange={timeRange} onClick={setTimeRange} />
                </div>
            </header>

            {!hasData ? (
                 <div className="flex flex-grow justify-center items-center text-slate-400 dark:text-slate-500">
                    <p>Not enough historical data to display chart.</p>
                </div>
            ) : (
                <div className="flex-grow w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(tick) => formatDate(tick, timeRange)}
                                stroke={chartColors.tick}
                                dy={10}
                                tick={{ fontSize: 12, fill: chartColors.tick }}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                tickFormatter={(value) => {
                                    if (isPrivacyMode) return '$ ****';
                                    if (typeof value !== 'number') return '';
                                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                                    return `$${value.toFixed(0)}`;
                                }}
                                stroke="#60a5fa"
                                tick={{ fontSize: 12, fill: '#60a5fa' }}
                                domain={['auto', 'auto']}
                                width={55}
                            />
                             {hasBtcData && (
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={(value) => {
                                        if (isPrivacyMode) return '$ ****';
                                        if (typeof value !== 'number') return '';
                                        if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                                        return `$${value.toFixed(0)}`;
                                    }}
                                    stroke="#f97316"
                                    tick={{ fontSize: 12, fill: '#f97316' }}
                                    domain={['auto', 'auto']}
                                    width={50}
                                />
                            )}
                            <Tooltip content={<CustomTooltip isPrivacyMode={isPrivacyMode} />} />
                            <Legend 
                                verticalAlign="top" 
                                align="left"
                                wrapperStyle={{ paddingBottom: '20px' }}
                                iconType="circle"
                                iconSize={8}
                                formatter={(value, entry) => {
                                    let label;
                                    if (value === 'portfolioValue') {
                                        label = 'Portfolio Value';
                                    } else if (value === 'btcPrice') {
                                        label = 'BTC Price';
                                    } else {
                                        label = value;
                                    }
                                    return <span style={{ color: chartColors.legend }} className="font-medium">{label}</span>;
                                }}
                            />
                            {hasBtcData && <Area yAxisId="right" type="monotone" name="BTC Price" dataKey="btcPrice" stroke="#f97316" fill="url(#colorBtc)" strokeWidth={2} />}
                            <Area yAxisId="left" type="monotone" name="Portfolio Value" dataKey="portfolioValue" stroke="#60a5fa" fill="url(#colorPortfolio)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default PerformanceChart;