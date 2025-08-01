
import React from 'react';
import { RebalancingSuggestion, Wallet, PriceData } from '../types';
import { XIcon, SparklesIcon, RefreshCwIcon } from './icons';
import { getAssetMetrics } from '../utils/calculations';

interface AdvisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
    suggestion: RebalancingSuggestion | null;
    isLoading: boolean;
    error: string | null;
    wallets: Wallet[];
    prices: PriceData;
}

const LoadingState = () => (
    <div className="text-center p-8">
        <SparklesIcon className="h-12 w-12 mx-auto text-purple-400 animate-pulse" />
        <p className="mt-4 text-lg text-slate-300">Analyzing your portfolio...</p>
        <p className="text-sm text-slate-400">The AI advisor is preparing your rebalancing suggestions.</p>
    </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
     <div className="text-center p-8 bg-red-900/20 rounded-lg m-6">
        <p className="text-lg font-semibold text-red-400">An Error Occurred</p>
        <p className="mt-2 text-sm text-red-300">{message}</p>
        <button
            onClick={onRetry}
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 inline-flex items-center space-x-2"
        >
            <RefreshCwIcon className="h-5 w-5"/>
            <span>Try Again</span>
        </button>
    </div>
);

const SuggestionDisplay: React.FC<{ suggestion: RebalancingSuggestion; wallets: Wallet[]; prices: PriceData; }> = ({ suggestion, wallets, prices }) => {
    const { summary, reasoning, suggestions } = suggestion;

    const currentAllocation = React.useMemo(() => {
        const assetValues = new Map<string, number>();
        let totalValue = 0;
        
        wallets.forEach(wallet => {
            wallet.assets.forEach(asset => {
                const price = prices[asset.id]?.usd ?? 0;
                const { marketValue } = getAssetMetrics(asset.transactions, price);
                if (marketValue > 0) {
                    const symbol = asset.symbol.toUpperCase();
                    assetValues.set(symbol, (assetValues.get(symbol) || 0) + marketValue);
                    totalValue += marketValue;
                }
            });
        });

        if (totalValue === 0) return new Map<string, number>();

        const allocationMap = new Map<string, number>();
        assetValues.forEach((value, symbol) => {
            allocationMap.set(symbol, (value / totalValue) * 100);
        });
        return allocationMap;
    }, [wallets, prices]);
    
    // Combine current and suggested allocations for easier rendering
    const allSymbols = new Set([...currentAllocation.keys(), ...suggestions.map(s => s.symbol.toUpperCase())]);
    const displayData = Array.from(allSymbols).map(symbol => {
        const current = currentAllocation.get(symbol) || 0;
        const suggestedItem = suggestions.find(s => s.symbol.toUpperCase() === symbol);
        const suggested = suggestedItem?.suggested_percentage || 0;
        const change = suggested - current;
        return {
            symbol,
            name: suggestedItem?.name || symbol, // Fallback to symbol if it's a new suggestion not in current portfolio
            current,
            suggested,
            change,
        };
    }).sort((a,b) => b.suggested - a.suggested);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-purple-300">Summary</h3>
                <p className="mt-1 text-slate-300">{summary}</p>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-purple-300">Reasoning</h3>
                <p className="mt-1 text-slate-300 whitespace-pre-wrap">{reasoning}</p>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-purple-300 mb-2">Rebalancing Plan</h3>
                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-700">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-slate-900/50 backdrop-blur-sm z-10">
                            <tr className="border-b border-slate-700 text-slate-400">
                                <th className="p-3 font-medium">Asset</th>
                                <th className="p-3 font-medium text-right">Current</th>
                                <th className="p-3 font-medium text-right">Suggested</th>
                                <th className="p-3 font-medium text-right">Change</th>
                            </tr>
                        </thead>
                         <tbody>
                            {displayData.map(({ symbol, name, current, suggested, change }) => (
                                <tr key={symbol} className="border-b border-slate-700/50">
                                    <td className="p-3 font-semibold text-white">{name} ({symbol})</td>
                                    <td className="p-3 font-mono text-slate-300 text-right">{current.toFixed(2)}%</td>
                                    <td className="p-3 font-mono text-right font-bold" style={{ color: suggested > current ? '#22c55e' : (suggested < current ? '#ef4444' : '#94a3b8') }}>
                                        {suggested.toFixed(2)}%
                                    </td>
                                     <td className="p-3 font-mono text-right" style={{ color: change > 0.01 ? '#22c55e' : (change < -0.01 ? '#ef4444' : '#94a3b8') }}>
                                        {change > 0 && '+'}{change.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


export const AdvisorModal: React.FC<AdvisorModalProps> = ({ isOpen, onClose, onRefresh, suggestion, isLoading, error, wallets, prices }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <SparklesIcon className="h-6 w-6 mr-3 text-purple-400"/>
                        AI Portfolio Advisor
                    </h2>
                    <div className="flex items-center space-x-2">
                         <button
                            onClick={onRefresh}
                            className="text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed p-2 rounded-full hover:bg-slate-700 transition-colors"
                            disabled={isLoading}
                            title="Refresh Suggestion"
                        >
                            <RefreshCwIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto">
                    {isLoading && <LoadingState />}
                    {error && <ErrorState message={error} onRetry={onRefresh}/>}
                    {suggestion && !isLoading && !error && <SuggestionDisplay suggestion={suggestion} wallets={wallets} prices={prices}/>}
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-700 rounded-b-lg flex-shrink-0">
                     <p className="text-xs text-amber-400/80 text-center">
                        Disclaimer: This is an AI-generated suggestion and not financial advice. All decisions are your own responsibility. Always do your own research.
                    </p>
                </div>
            </div>
        </div>
    );
};
