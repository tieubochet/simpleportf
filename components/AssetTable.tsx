
import React from 'react';
import { PortfolioAsset, PriceData } from '../types';
import { TrashIcon } from './icons';

interface AssetTableProps {
  assets: PortfolioAsset[];
  prices: PriceData;
  onRemove: (assetId: string) => void;
}

const AssetTable: React.FC<AssetTableProps> = ({ assets, prices, onRemove }) => {
    
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
    
  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Your Assets</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                        <th className="py-3 px-4 font-medium">Asset</th>
                        <th className="py-3 px-4 font-medium text-right">Price</th>
                        <th className="py-3 px-4 font-medium text-right">Holdings</th>
                        <th className="py-3 px-4 font-medium text-right">Value</th>
                        <th className="py-3 px-4 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map(asset => {
                        const price = prices[asset.id]?.usd ?? 0;
                        const value = asset.amount * price;
                        const isPriceLoading = price === 0 && asset.amount > 0;
                        return (
                            <tr key={asset.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                <td className="py-4 px-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white">{asset.name}</span>
                                        <span className="text-sm text-slate-400 uppercase">{asset.symbol}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    {isPriceLoading ? <div className="h-5 bg-slate-700 rounded animate-pulse w-20 ml-auto"></div> : formatCurrency(price)}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-white">{asset.amount}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                     {isPriceLoading ? <div className="h-5 bg-slate-700 rounded animate-pulse w-24 ml-auto"></div> : formatCurrency(value)}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <button onClick={() => onRemove(asset.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AssetTable;
