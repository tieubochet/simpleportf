import React from 'react';
import { PortfolioAsset, PriceData } from '../types';
import { TrashIcon, ReceiptIcon } from './icons';
import { getAssetMetrics } from '../utils/calculations';

interface AssetTableProps {
  assets: PortfolioAsset[];
  prices: PriceData;
  onRemove: (assetId: string) => void;
  onAddTransaction: (asset: PortfolioAsset) => void;
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
    const colorClass = isProfit ? 'text-green-400' : 'text-red-400';
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
    const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
    const sign = isPositive ? '+' : '';

    return (
        <span className={colorClass}>
            {sign}{value.toFixed(2)}%
        </span>
    );
};


const AssetTable: React.FC<AssetTableProps> = ({ assets, prices, onRemove, onAddTransaction }) => {
    
  return (
    <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-800 z-10">
                <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-3 px-2 font-medium text-center">#</th>
                    <th className="py-3 px-4 font-medium">Asset</th>
                    <th className="py-3 px-4 font-medium text-right">Quantity</th>
                    <th className="py-3 px-4 font-medium text-right">Avg. Buy Price</th>
                    <th className="py-3 px-4 font-medium text-right">Current Price</th>
                    <th className="py-3 px-4 font-medium text-right">24h %</th>
                    <th className="py-3 px-4 font-medium text-right">7d %</th>
                    <th className="py-3 px-4 font-medium text-right">P/L</th>
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
                        <tr key={asset.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                             <td className="py-4 px-2 text-center font-mono text-slate-400">
                                {priceInfo?.market_cap_rank ?? '-'}
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-base text-white">{asset.name}</span>
                                    <span className="text-xs text-slate-400 uppercase">{asset.symbol}</span>
                                </div>
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-white">{formatNumber(currentQuantity)}</td>
                            <td className="py-4 px-4 text-right font-mono text-slate-300">{formatCurrency(avgBuyPrice)}</td>
                            <td className="py-4 px-4 text-right font-mono">
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
                                        onClick={() => onAddTransaction(asset)} 
                                        className="text-slate-400 hover:text-cyan-400 transition-colors p-2 rounded-full"
                                        aria-label={`Add transaction for ${asset.name}`}
                                        title="Add Transaction"
                                    >
                                        <ReceiptIcon className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => onRemove(asset.id)} 
                                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full"
                                        aria-label={`Remove ${asset.name}`}
                                        title="Remove Asset"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
  );
};

export default AssetTable;