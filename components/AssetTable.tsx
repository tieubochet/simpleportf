
import React, { useState } from 'react';
import { PortfolioAsset, PriceData, Transaction } from '../types';
import { TrashIcon, ReceiptIcon, ChevronDownIcon, ChevronUpIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import { getAssetMetrics } from '../utils/calculations';

type SortKey = 'rank' | 'change24h' | 'pl';

interface SortConfig {
    key: SortKey | null;
    direction: 'asc' | 'desc';
}

interface AssetTableProps {
  assets: PortfolioAsset[];
  prices: PriceData;
  onRemove: (assetId: string) => void;
  onAddTransaction: (asset: PortfolioAsset) => void;
  sortConfig: SortConfig;
  onSortChange: (key: SortKey) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    }).format(value);
}

const ProfitLoss: React.FC<{ value: number }> = ({ value }) => {
    const isProfit = value >= 0;
    const colorClass = isProfit ? 'text-green-500' : 'text-red-500';
    const sign = isProfit ? '+' : '';

    return (
        <span className={colorClass}>
            {sign}{formatCurrency(value)}
        </span>
    );
};

const ChangePercentage: React.FC<{ value: number | undefined }> = ({ value }) => {
    if (typeof value !== 'number' || isNaN(value)) {
        return <span className="text-slate-400">-</span>;
    }
    const isPositive = value >= 0;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    const sign = isPositive ? '+' : '';

    return (
        <span className={colorClass}>
            {sign}{value.toFixed(2)}%
        </span>
    );
};

const TransactionHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const typeClasses: Record<string, string> = {
        buy: 'bg-green-500/10 text-green-400',
        sell: 'bg-red-500/10 text-red-400',
        transfer_in: 'bg-blue-500/10 text-blue-400',
        transfer_out: 'bg-yellow-500/10 text-yellow-400',
    };

    const formatTxType = (type: string) => {
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="px-4 py-3 bg-slate-900/50">
            <h4 className="text-sm font-semibold text-white mb-2 px-3">Transaction History</h4>
            <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-900/50 backdrop-blur-sm z-10">
                        <tr className="border-b border-slate-700 text-slate-400">
                            <th className="p-3 font-medium">Type</th>
                            <th className="p-3 font-medium">Date</th>
                            <th className="p-3 font-medium text-right">Quantity</th>
                            <th className="p-3 font-medium text-right">Price</th>
                            <th className="p-3 font-medium text-right">Fee</th>
                            <th className="p-3 font-medium">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTransactions.map(tx => (
                             <tr key={tx.id} className="border-b border-slate-700/50">
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeClasses[tx.type]}`}>
                                        {formatTxType(tx.type)}
                                    </span>
                                </td>
                                <td className="p-3 font-mono text-slate-300">{new Date(tx.date).toLocaleDateString('en-CA')}</td>
                                <td className="p-3 font-mono text-slate-200 text-right">{tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                                <td className="p-3 font-mono text-slate-300 text-right">
                                    {tx.type === 'buy' || tx.type === 'sell' ? `$${tx.pricePerUnit.toLocaleString(undefined, {style: 'currency', currency: 'USD'}).replace('$', '')}` : '-'}
                                </td>
                                <td className="p-3 font-mono text-slate-300 text-right">
                                    {tx.fee ? formatCurrency(tx.fee) : <span className="text-slate-500">-</span>}
                                </td>
                                <td className="p-3 text-slate-400 max-w-[150px] whitespace-normal break-words">{tx.notes || <span className="text-slate-500">-</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const AssetTable: React.FC<AssetTableProps> = ({ assets, prices, onRemove, onAddTransaction, sortConfig, onSortChange }) => {
    const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

    const handleToggleExpand = (assetId: string) => {
        setExpandedAssetId(prevId => (prevId === assetId ? null : assetId));
    };
    
  return (
    <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-800 z-10">
                <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-3 px-2 font-medium text-center">
                        <button
                            onClick={() => onSortChange('rank')}
                            className="flex items-center justify-center w-full group text-slate-400 hover:text-white transition-colors"
                            title="Sort by Rank"
                        >
                            #
                            <span className="ml-1">
                                {sortConfig.key === 'rank' && sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> :
                                 sortConfig.key === 'rank' && sortConfig.direction === 'desc' ? <ArrowDownIcon className="h-4 w-4" /> :
                                 <div className="h-4 w-4" />
                                }
                            </span>
                        </button>
                    </th>
                    <th className="py-3 px-4 font-medium">Asset</th>
                    <th className="py-3 px-4 font-medium text-right">Quantity</th>
                    <th className="py-3 px-4 font-medium text-right">Avg. Buy Price</th>
                    <th className="py-3 px-4 font-medium text-right">Current Price</th>
                    <th className="py-3 px-4 font-medium text-right">
                        <button
                            onClick={() => onSortChange('change24h')}
                            className="flex items-center justify-end w-full group text-slate-400 hover:text-white transition-colors"
                            title="Sort by 24h %"
                        >
                            24h %
                            <span className="ml-1">
                                {sortConfig.key === 'change24h' && sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> :
                                 sortConfig.key === 'change24h' && sortConfig.direction === 'desc' ? <ArrowDownIcon className="h-4 w-4" /> :
                                 <div className="h-4 w-4" />
                                }
                            </span>
                        </button>
                    </th>
                    <th className="py-3 px-4 font-medium text-right">7d %</th>
                    <th className="py-3 px-4 font-medium text-right">
                         <button
                            onClick={() => onSortChange('pl')}
                            className="flex items-center justify-end w-full group text-slate-400 hover:text-white transition-colors"
                            title="Sort by P/L"
                        >
                            P/L
                            <span className="ml-1">
                                {sortConfig.key === 'pl' && sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> :
                                 sortConfig.key === 'pl' && sortConfig.direction === 'desc' ? <ArrowDownIcon className="h-4 w-4" /> :
                                 <div className="h-4 w-4" />
                                }
                            </span>
                        </button>
                    </th>
                    <th className="py-3 px-4 font-medium text-right">Value</th>
                    <th className="py-3 px-4 font-medium text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {assets.map(asset => {
                    const priceInfo = prices[asset.id];
                    const currentPrice = priceInfo?.usd ?? 0;
                    const change24h = priceInfo?.usd_24h_change;
                    const change7d = priceInfo?.usd_7d_change;
                    const { currentQuantity, avgBuyPrice, unrealizedPL, marketValue } = getAssetMetrics(asset.transactions, currentPrice);
                    const isPriceLoading = currentPrice === 0 && currentQuantity > 0;
                    
                    if (currentQuantity <= 0) return null; // Don't show assets that have been fully sold

                    return (
                        <React.Fragment key={asset.id}>
                            <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                                <td 
                                    className="py-4 px-2 text-center font-mono text-slate-400 cursor-pointer"
                                    onClick={() => asset.transactions.length > 0 && handleToggleExpand(asset.id)}
                                >
                                    <div className="flex items-center justify-center">
                                        {asset.transactions.length > 0 ? (
                                            <span className="text-slate-500">
                                                {expandedAssetId === asset.id ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                            </span>
                                        ) : <span className="w-4"></span>}
                                        <span className="ml-2">{priceInfo?.market_cap_rank ?? '-'}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-base text-white">{asset.name}</span>
                                        <span className="text-xs text-slate-400 uppercase">{asset.symbol}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-white">{formatNumber(currentQuantity)}</td>
                                <td className="py-4 px-4 text-right font-mono text-slate-300">{formatCurrency(avgBuyPrice)}</td>
                                <td className="py-4 px-4 text-right font-mono text-slate-100">
                                    {isPriceLoading ? <div className="h-5 bg-slate-700 rounded animate-pulse w-20 ml-auto"></div> : formatCurrency(currentPrice)}
                                </td>
                                <td className="py-4 px-4 text-right font-mono">
                                    {isPriceLoading ? (
                                        <div className="h-5 bg-slate-700 rounded animate-pulse w-16 ml-auto"></div>
                                    ) : (
                                        <ChangePercentage value={change24h} />
                                    )}
                                </td>
                                <td className="py-4 px-4 text-right font-mono">
                                    {isPriceLoading ? (
                                        <div className="h-5 bg-slate-700 rounded animate-pulse w-16 ml-auto"></div>
                                    ) : (
                                        <ChangePercentage value={change7d} />
                                    )}
                                </td>
                                <td className="py-4 px-4 text-right font-mono">
                                    {isPriceLoading ? <div className="h-5 bg-slate-700 rounded animate-pulse w-20 ml-auto"></div> : <ProfitLoss value={unrealizedPL} />}
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-white font-bold">
                                    {isPriceLoading ? <div className="h-5 bg-slate-700 rounded animate-pulse w-24 ml-auto"></div> : formatCurrency(marketValue)}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onAddTransaction(asset); }}
                                            className="text-slate-400 hover:text-cyan-400 transition-colors p-2 rounded-full"
                                            aria-label={`Add transaction for ${asset.name}`}
                                            title="Add Transaction"
                                        >
                                            <ReceiptIcon className="h-5 w-5" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onRemove(asset.id); }}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full"
                                            aria-label={`Remove ${asset.name}`}
                                            title="Remove Asset"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {expandedAssetId === asset.id && asset.transactions.length > 0 && (
                                <tr className="bg-slate-800/50">
                                    <td colSpan={10} className="p-0 border-none">
                                        <TransactionHistory transactions={asset.transactions} />
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
            </tbody>
        </table>
    </div>
  );
};

export default AssetTable;
