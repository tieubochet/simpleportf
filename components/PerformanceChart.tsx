
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HistoricalDataPoint } from '../types';

interface PerformanceChartProps {
  portfolioData: HistoricalDataPoint[];
  btcData: HistoricalDataPoint[];
  isLoading: boolean;
  timeRange: '4h' | '24h' | '7d';
  setTimeRange: (range: '4h' | '24h' | '7d') => void;
  isPrivacyMode: boolean;
}

const formatDate = (tickItem: number, range: '4h' | '24h' | '7d') => {
    const date = new Date(tickItem);
    if (range === '4h' || range === '24h') {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label, isPrivacyMode }: any) => {
  if (active && payload && payload.length) {
    const portfolio = payload.find(p => p.dataKey === 'portfolioValue');
    const btc = payload.find(p => p.dataKey === 'btcPrice');

    return (
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 p-3 rounded-lg shadow-lg text-sm text-white">
        <p className="font-bold mb-2">{new Date(label).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        {btc && <p style={{ color: '#f97316' }}>BTC Price: {isPrivacyMode ? '$ ****' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(btc.value)}</p>}
        {portfolio && <p style={{ color: '#60a5fa' }}>Portfolio Value: {isPrivacyMode ? '$ ****' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(portfolio.value)}</p>}
      </div>
    );
  }
  return null;
};

const LoadingSkeleton = () => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg min-h-[440px] animate-pulse">
        <div className="flex justify-between items-center mb-6">
            <div className="h-7 w-32 bg-slate-700 rounded-md"></div>
            <div className="flex space-x-2">
                <div className="h-7 w-12 bg-slate-700 rounded-md"></div>
                <div className="h-7 w-12 bg-slate-700 rounded-md"></div>
                <div className="h-7 w-12 bg-slate-700 rounded-md"></div>
            </div>
        </div>
        <div className="h-[350px] w-full bg-slate-700 rounded-md"></div>
    </div>
);

const TimeRangeButton: React.FC<{ label: string; range: '4h' | '24h' | '7d'; activeRange: string; onClick: (range: '4h' | '24h' | '7d') => void }> = ({ label, range, activeRange, onClick }) => {
    const isActive = range === activeRange;
    return (
        <button
            onClick={() => onClick(range)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${
                isActive
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
        >
            {label}
        </button>
    )
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ portfolioData, btcData, isLoading, timeRange, setTimeRange, isPrivacyMode }) => {
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

    if (isLoading) {
        return <LoadingSkeleton />;
    }
    
    const hasData = chartData.length > 0;

    return (
        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg min-h-[440px]">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-3 sm:mb-0">Performance</h3>
                <div className="flex items-center space-x-2">
                    <TimeRangeButton label="4H" range="4h" activeRange={timeRange} onClick={setTimeRange} />
                    <TimeRangeButton label="24H" range="24h" activeRange={timeRange} onClick={setTimeRange} />
                    <TimeRangeButton label="7D" range="7d" activeRange={timeRange} onClick={setTimeRange} />
                </div>
            </header>

            {!hasData ? (
                 <div className="flex h-[350px] justify-center items-center text-slate-500">
                    <p>Not enough historical data to display chart.</p>
                </div>
            ) : (
                <div className="h-[350px] w-full">
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(tick) => formatDate(tick, timeRange)}
                                stroke="#94a3b8"
                                dy={10}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
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
                                    return <span className="text-slate-200 font-medium">{label}</span>;
                                }}
                            />
                            {hasBtcData && <Area yAxisId="right" type="stepAfter" name="BTC Price" dataKey="btcPrice" stroke="#f97316" fill="url(#colorBtc)" strokeWidth={2} />}
                            <Area yAxisId="left" type="stepAfter" name="Portfolio Value" dataKey="portfolioValue" stroke="#60a5fa" fill="url(#colorPortfolio)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default PerformanceChart;
