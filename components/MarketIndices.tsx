import React, { useState, useEffect } from 'react';
import { GlobalStatsData } from '../types';
import { BoltIcon } from './icons';
import { fetchEtherscanGasPriceGwei } from '../services/marketData';

// Reusable stat card component
const StatCard: React.FC<{ title: string; value: string; change?: number; changeColorClass?: string; icon?: React.ReactNode }> = ({ title, value, change, changeColorClass, icon }) => (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg h-full">
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
          {icon && <span className="mr-2">{icon}</span>}
          <span>{title}</span>
        </div>
        <p className="text-2xl font-semibold text-slate-800 dark:text-white mt-1">{value}</p>
        {typeof change === 'number' && !isNaN(change) && (
            <p className={`text-sm font-mono mt-1 ${changeColorClass}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}% (24h)
            </p>
        )}
    </div>
);

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        compactDisplay: 'short',
    }).format(value);
};

const LoadingSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-full">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-2"></div>
                </div>
            ))}
        </div>
    </div>
);

const MarketIndices: React.FC<{ data: Omit<GlobalStatsData, 'eth_gas_price_gwei'> | null; isLoading: boolean }> = ({ data, isLoading }) => {
    const [gasPrice, setGasPrice] = useState<number | null>(null);
    const [isGasLoading, setIsGasLoading] = useState(true);

    useEffect(() => {
        const getGasPrice = async () => {
            setIsGasLoading(true);
            const price = await fetchEtherscanGasPriceGwei();
            setGasPrice(price);
            setIsGasLoading(false);
        };

        getGasPrice();
        // Refresh gas price every minute
        const interval = setInterval(getGasPrice, 60000); 
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!data) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Market Snapshot</h2>
                <p className="text-center text-slate-500 dark:text-slate-400">Could not load market data.</p>
            </div>
        );
    }

    const marketCapChange = data.market_cap_change_percentage_24h_usd;
    const marketCapChangeColor = marketCapChange >= 0 ? 'text-green-500' : 'text-red-500';
    const gasDisplayValue = isGasLoading 
        ? '...' 
        : (gasPrice !== null && gasPrice > 0) 
            ? `${gasPrice.toFixed(gasPrice < 1 ? 2 : 0)} Gwei` 
            : '-';


    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Market Snapshot</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
                <StatCard 
                    title="Market Cap"
                    value={formatCurrency(data.total_market_cap)}
                    change={marketCapChange}
                    changeColorClass={marketCapChangeColor}
                />
                 <StatCard 
                    title="24h Volume"
                    value={formatCurrency(data.total_volume_24h)}
                />
                <StatCard
                    title="ETH Gas (Fast)"
                    value={gasDisplayValue}
                    icon={<BoltIcon className="h-4 w-4 text-amber-500" />}
                />
                 <StatCard 
                    title="BTC Dominance"
                    value={`${data.btc_dominance.toFixed(2)}%`}
                />
                 <StatCard 
                    title="ETH Dominance"
                    value={`${data.eth_dominance.toFixed(2)}%`}
                />
                 <StatCard 
                    title="Active Coins"
                    value={new Intl.NumberFormat('en-US').format(data.active_cryptocurrencies)}
                />
            </div>
             <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Data provided by <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">CoinGecko</a> & Etherscan
                </p>
            </div>
        </div>
    );
};

export default MarketIndices;