import React from 'react';
import { MarketIndicesData, MarketIndex, GroundingSource } from '../types';
import { InfoIcon } from './icons';

interface MarketIndicesProps {
    data: MarketIndicesData | null;
    isLoading: boolean;
    sources?: GroundingSource[];
}

const ChangeDisplay: React.FC<{ change: string | number | undefined }> = ({ change }) => {
    if (typeof change !== 'number' && typeof change !== 'string') {
        return null;
    }

    const numericChange = typeof change === 'string' ? parseFloat(change) : change;
    if (isNaN(numericChange)) {
      return <span className="text-slate-500 dark:text-slate-400">{change}</span>
    }
    
    const isPositive = numericChange >= 0;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    const sign = isPositive ? '+' : '';

    return <span className={`w-20 text-right font-mono ${colorClass}`}>{`${sign}${numericChange.toFixed(2)}%`}</span>;
};


const IndexRow: React.FC<{ item: MarketIndex }> = ({ item }) => {
    return (
        <div className="flex items-start justify-between py-4">
            <span className="text-slate-500 dark:text-slate-300 flex-1 pr-4">{item.name}</span>
            <div className="flex items-baseline space-x-6 text-right">
                {item.change_24h_btc && (
                    <span className={`w-20 text-right font-mono ${String(item.change_24h_btc).includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                        {item.change_24h_btc}
                    </span>
                )}
                {item.change !== undefined && <ChangeDisplay change={item.change} />}
                <span className="w-24 text-right font-semibold text-slate-700 dark:text-slate-100">{item.value}</span>
                {item.sentiment && (
                    <span className="w-24 text-right font-semibold text-slate-700 dark:text-slate-100">{item.sentiment}</span>
                )}
            </div>
        </div>
    );
};


const LoadingSkeletonRow = () => (
    <div className="flex items-center justify-between py-4 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-40"></div>
        <div className="flex items-center space-x-6">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-20"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-24"></div>
        </div>
    </div>
);


const MarketIndices: React.FC<MarketIndicesProps> = ({ data, isLoading, sources }) => {
    
    const indicesOrder: (keyof MarketIndicesData)[] = [
        'gold_future',
        'dxy',
        'btc_dominance',
        'btc_exchange_balance',
        'fear_and_greed',
        'open_interest',
        'liquidations',
        'avg_rsi',
        'altcoin_season_index'
    ];
    
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg h-full flex flex-col">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Market Indices</h3>
            <div className="text-sm divide-y divide-slate-200 dark:divide-slate-800 flex-grow">
                {isLoading ? (
                    Array.from({ length: 9 }).map((_, index) => <LoadingSkeletonRow key={index} />)
                ) : data ? (
                    indicesOrder.map(key => data[key] && <IndexRow key={key} item={data[key]} />)
                ) : (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        Could not load market indices.
                    </div>
                )}
            </div>
            {sources && sources.length > 0 && !isLoading && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Data provided by Gemini, grounded on information from:
                    </p>
                    <ul className="text-xs space-y-1">
                        {sources.slice(0, 3).map((source, index) => (
                            <li key={index} className="truncate">
                                <a 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-cyan-600 dark:text-cyan-400 hover:underline"
                                    title={source.web.title || source.web.uri}
                                >
                                    {source.web.title || new URL(source.web.uri).hostname}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MarketIndices;