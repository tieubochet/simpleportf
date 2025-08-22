import React from 'react';
import { MarketIndicesData, MarketIndex } from '../types';

interface MarketIndicesProps {
    data: MarketIndicesData | null;
    isLoading: boolean;
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
                    <span className={`w-20 text-right font-mono ${parseFloat(String(item.change_24h_btc)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.change_24h_btc}
                    </span>
                )}
                {item.change && <ChangeDisplay change={item.change} />}
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


const MarketIndices: React.FC<MarketIndicesProps> = ({ data, isLoading }) => {
    
    const indicesOrder: (keyof MarketIndicesData)[] = [
        'gold_future',
        'dxy',
        'btc_dominance',
        'btc_exchange_balance',
        'fear_and_greed'
    ];
    
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg h-full">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Chỉ số</h3>
            <div className="text-sm divide-y divide-slate-200 dark:divide-slate-800">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => <LoadingSkeletonRow key={index} />)
                ) : data ? (
                    indicesOrder.map(key => data[key] && <IndexRow key={key} item={data[key]} />)
                ) : (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        Could not load market indices.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketIndices;