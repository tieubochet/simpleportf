
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Brush, ResponsiveContainer } from 'recharts';
import { HistoricalDataPoint } from '../types';

type TimeRange = '24h' | '7d';

interface PerformanceChartProps {
  data: HistoricalDataPoint[];
  isLoading: boolean;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
}

const formatValue = (value: number) => {
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const formatDate = (tickItem: number, timeRange: string) => {
    const date = new Date(tickItem);
    if (timeRange === '24h') {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label, timeRange }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-600 p-3 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-white">{formatValue(payload[0].value)}</p>
        <p className="text-slate-400">{new Date(label).toLocaleString('en-US', {
            dateStyle: timeRange === '24h' ? undefined : 'medium',
            timeStyle: timeRange === '24h' ? 'short' : undefined,
        })}</p>
      </div>
    );
  }
  return null;
};

const TimeRangeButton: React.FC<{
    label: string;
    range: TimeRange;
    activeRange: string;
    onClick: (range: TimeRange) => void;
}> = ({ label, range, activeRange, onClick }) => {
    const isActive = activeRange === range;
    return (
        <button
            onClick={() => onClick(range)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                isActive
                ? 'bg-slate-600 text-white'
                : 'bg-transparent text-slate-400 hover:bg-slate-700'
            }`}
        >
            {label}
        </button>
    );
};

const LoadingSkeleton = () => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg min-h-[440px] animate-pulse">
        <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-slate-700 rounded-md"></div>
            <div className="flex space-x-1 p-1 bg-slate-700/50 rounded-lg">
                <div className="h-7 w-10 bg-slate-600 rounded-md"></div>
                <div className="h-7 w-10 bg-slate-700 rounded-md"></div>
            </div>
        </div>
        <div className="h-[350px] w-full bg-slate-700 rounded-md"></div>
    </div>
);


const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, isLoading, timeRange, setTimeRange }) => {
    if (isLoading) {
        return <LoadingSkeleton />;
    }
    
    if (!data || data.length === 0) {
        return (
             <div className="bg-slate-800 p-6 rounded-lg shadow-lg min-h-[440px]">
                <h3 className="text-xl font-semibold text-white">Performance</h3>
                <div className="flex h-[350px] justify-center items-center text-slate-400">
                    <p>Not enough historical data to display chart.</p>
                </div>
            </div>
        );
    }

    const timeRanges: { label: string; range: TimeRange }[] = [
        { label: '24H', range: '24h' },
        { label: '7D', range: '7d' },
    ];
    
    const chartData = data.map(([timestamp, value]) => ({ timestamp, value }));

    const minVal = Math.min(...chartData.map(d => d.value));
    const maxVal = Math.max(...chartData.map(d => d.value));
    const domainMargin = (maxVal - minVal) * 0.05; // 5% margin
    const chartDomain = [minVal - domainMargin, maxVal + domainMargin];
    
    const isFlat = maxVal - minVal < 1; // Check if data is basically a flat line
    const finalDomain = isFlat ? [minVal - 1, maxVal + 1] : chartDomain;

    const portfolioHasGained = chartData.length > 1 && chartData[chartData.length - 1].value >= chartData[0].value;
    const strokeColor = portfolioHasGained ? '#22c55e' : '#ef4444'; // green-500 or red-500

    return (
        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-3 sm:mb-0">Performance</h3>
                <div className="flex items-center space-x-1 bg-slate-700/50 p-1 rounded-lg">
                    {timeRanges.map(item => (
                        <TimeRangeButton key={item.range} {...item} activeRange={timeRange} onClick={setTimeRange} />
                    ))}
                </div>
            </div>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(tick) => formatDate(tick, timeRange)}
                            stroke="#94a3b8"
                            dy={10}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            dataKey="value"
                            tickFormatter={formatValue}
                            stroke="#94a3b8"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            domain={finalDomain}
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <Tooltip content={<CustomTooltip timeRange={timeRange} />} cursor={{ stroke: '#64748b', strokeDasharray: '3 3' }} />
                        <Area type="monotone" dataKey="value" stroke={strokeColor} fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                        
                        <Brush dataKey="timestamp" height={30} stroke="#334155" fill="#1e293b" tickFormatter={(tick) => formatDate(tick, timeRange)}>
                            <AreaChart>
                                <Area type="monotone" dataKey="value" stroke="#64748b" fill="#334155" />
                            </AreaChart>
                        </Brush>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PerformanceChart;
