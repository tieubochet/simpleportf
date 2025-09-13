
import React from 'react';
import { MarketIndicesData, MarketIndex } from '../types';

// Renders the percentage change with appropriate color coding.
const ChangeDisplay: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value >= 0;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    const sign = isPositive ? '+' : '';
    return <span className={`font-mono ${color}`}>{`${sign}${value.toFixed(2)}%`}</span>;
};

// Renders a single row in the market indices list.
const IndexRow: React.FC<{ index: MarketIndex }> = ({ index }) => {
    const { name, value, change, changeBtc, sentiment } = index;

    return (
        <div className="grid grid-cols-3 items-center text-sm py-2.5">
            <p className="text-slate-300 col-span-1">{name}</p>
            
            <div className="col-span-2 flex justify-end items-center space-x-8 font-mono">
                {/* Middle Column */}
                <div className="w-24 text-right">
                    {typeof change === 'number' && <ChangeDisplay value={change} />}
                    {changeBtc && <span className="text-green-500">{changeBtc}</span>}
                    {sentiment && <span className="text-white">{value}</span>}
                </div>
                {/* Right Column */}
                <div className="w-28 text-right text-white font-semibold">
                    {(typeof change === 'number' || changeBtc) && value}
                    {sentiment && sentiment}
                </div>
            </div>
        </div>
    );
};

// A skeleton loader to show while data is fetching.
const LoadingSkeleton = () => (
    <div className="space-y-2 animate-pulse">
        {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2.5">
                <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                <div className="flex items-center space-x-8">
                    <div className="h-4 bg-slate-700 rounded w-24"></div>
                    <div className="h-4 bg-slate-700 rounded w-28"></div>
                </div>
            </div>
        ))}
    </div>
);

const MarketIndices: React.FC<{ data: MarketIndicesData | null; isLoading: boolean }> = ({ data, isLoading }) => {
    return (
        <div className="bg-[#161c2d] p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Market Indices</h2>
            {isLoading && <LoadingSkeleton />}
            {!isLoading && !data && (
                <div className="text-center text-slate-400 py-8">
                    Could not load market data.
                </div>
            )}
            {!isLoading && data && (
                <div className="divide-y divide-slate-700/50">
                    {Object.values(data).map(index => (
                        <IndexRow key={index.name} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MarketIndices;
