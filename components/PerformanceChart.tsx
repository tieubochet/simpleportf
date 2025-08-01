
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HistoricalDataPoint, Wallet, PriceData } from '../types';
import AllocationChart from './AllocationChart';
import { InfoIcon } from './icons';

interface PerformanceChartProps {
  portfolioData: HistoricalDataPoint[];
  btcData: HistoricalDataPoint[];
  wallets: Wallet[];
  prices: PriceData;
  isLoading: boolean;
  timeRange: '4h' | '24h' | '7d';
  setTimeRange: (range: '4h' | '24h' | '7d') => void;
}

const formatDate = (tickItem: number) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const portfolio = payload.find(p => p.dataKey === 'portfolio');
    const btc = payload.find(p => p.dataKey === 'btc');

    return (
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 p-3 rounded-lg shadow-lg text-sm text-white">
        <p className="font-bold mb-2">{new Date(label).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        {portfolio && <p style={{ color: portfolio.color }}>All-time profit: {portfolio.value.toFixed(2)}%</p>}
        {btc && <p style={{ color: btc.color }}>BTC trend: {btc.value.toFixed(2)}%</p>}
      </div>
    );
  }
  return null;
};

const LoadingSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg min-h-[440px] animate-pulse">
        <div className="flex justify-between items-center mb-6">
            <div className="h-7 w-48 bg-slate-200 rounded-md"></div>
        </div>
        <div className="h-[350px] w-full bg-slate-200 rounded-md"></div>
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
            isActive
                ? 'bg-slate-200 text-slate-900'
                : 'bg-transparent text-slate-500 hover:bg-slate-100'
        }`}
    >
        {label}
    </button>
);


const PerformanceChart: React.FC<PerformanceChartProps> = ({ portfolioData, btcData, wallets, prices, isLoading, timeRange, setTimeRange }) => {
    const [activeTab, setActiveTab] = useState<'performance' | 'allocation'>('performance');
    
    const chartData = useMemo(() => {
        if (!portfolioData || portfolioData.length < 2 || !btcData || btcData.length < 2) {
            return [];
        }

        // 1. Create price maps for efficient lookup
        const portfolioMap = new Map(portfolioData);
        const btcMap = new Map(btcData);

        // 2. Create a unified timeline
        const allTimestamps = new Set([...portfolioData.map(p => p[0]), ...btcData.map(p => p[0])]);
        const unifiedTimeline = Array.from(allTimestamps).sort((a, b) => a - b);

        let lastPortfolioValue = portfolioData[0][1];
        let lastBtcValue = btcData[0][1];
        
        // Find the first timestamp where both have data to start the series
        const firstPortfolioTime = portfolioData[0][0];
        const firstBtcTime = btcData[0][0];
        const startTime = Math.max(firstPortfolioTime, firstBtcTime);

        // 3. Align data along the unified timeline
        const alignedData = unifiedTimeline
            .filter(ts => ts >= startTime) // Start only when both series have data
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

        // 4. Calculate percentage change from the first data point
        const initialPortfolioValue = alignedData[0].portfolioValue;
        const initialBtcValue = alignedData[0].btcValue;

        return alignedData.map(d => ({
            timestamp: d.timestamp,
            portfolio: initialPortfolioValue > 0 ? ((d.portfolioValue - initialPortfolioValue) / initialPortfolioValue) * 100 : 0,
            btc: initialBtcValue > 0 ? ((d.btcValue - initialBtcValue) / initialBtcValue) * 100 : 0,
        }));

    }, [portfolioData, btcData]);

    if (isLoading) {
        return <LoadingSkeleton />;
    }
    
    const hasData = activeTab === 'performance' ? chartData.length > 0 : wallets.length > 0;

    return (
        <div className="bg-white text-slate-900 p-4 sm:p-6 rounded-lg shadow-lg">
            <header className="flex items-center space-x-4 mb-6 border-b border-slate-200 -mx-6 px-6 pb-4">
                <TabButton label="Performance" isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
                <TabButton label="Allocation" isActive={activeTab === 'allocation'} onClick={() => setActiveTab('allocation')} />
                <div 
                    className="text-slate-400 hover:text-slate-600 cursor-help"
                    title="This chart shows the percentage growth of your portfolio over time compared to Bitcoin's price trend. The 'Allocation' tab shows the distribution of your assets."
                >
                    <InfoIcon className="h-5 w-5" />
                </div>
            </header>

            {!hasData ? (
                 <div className="flex h-[350px] justify-center items-center text-slate-500">
                    <p>Not enough historical data to display chart.</p>
                </div>
            ) : activeTab === 'performance' ? (
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={formatDate}
                                stroke="#64748b"
                                dy={10}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tickFormatter={(tick) => `${tick.toFixed(0)}%`}
                                stroke="#64748b"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                verticalAlign="top" 
                                align="left"
                                wrapperStyle={{ paddingBottom: '20px' }}
                                iconType="circle"
                                iconSize={8}
                                formatter={(value, entry) => {
                                    const { color } = entry;
                                    const label = value === 'portfolio' ? 'All-time profit' : 'BTC trend';
                                    return <span style={{ color: color, fontWeight: 500 }}>{label}</span>;
                                }}
                            />
                            <Area type="monotone" name="All-time profit" dataKey="portfolio" stroke="#60a5fa" fill="url(#colorPortfolio)" strokeWidth={2} />
                            <Area type="monotone" name="BTC trend" dataKey="btc" stroke="#f97316" fill="transparent" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-slate-900">
                  <AllocationChart wallets={wallets} prices={prices} />
                </div>
            )}
        </div>
    );
};

export default PerformanceChart;
