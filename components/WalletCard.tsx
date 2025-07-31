
import React, { useState, useMemo } from 'react';
import { Wallet, PriceData, PortfolioAsset } from '../types';
import AssetTable from './AssetTable';
import { PlusIcon, TrashIcon } from './icons';
import { calculateTotalValue, getAssetMetrics } from '../utils/calculations';

interface WalletCardProps {
    wallet: Wallet;
    prices: PriceData;
    onAddAsset: (walletId: string) => void;
    onRemoveAsset: (walletId: string, assetId: string) => void;
    onRemoveWallet: (walletId:string) => void;
    onAddTransaction: (walletId: string, asset: PortfolioAsset) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, prices, onAddAsset, onRemoveAsset, onRemoveWallet, onAddTransaction }) => {
    
    const [visibleCount, setVisibleCount] = useState(10);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

    const handleSortChange = () => {
        setSortDirection(current => {
            if (current === null) return 'asc';
            if (current === 'asc') return 'desc';
            return null; // Cycle back to unsorted
        });
    };

    const walletTotalValue = calculateTotalValue([wallet], prices);
    
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(walletTotalValue);
    
    // Filter assets with a positive quantity to determine what can be displayed.
    const displayableAssets = useMemo(() => {
        return wallet.assets.filter(asset => {
            const { currentQuantity } = getAssetMetrics(asset.transactions, prices[asset.id]?.usd ?? 0);
            return currentQuantity > 0;
        });
    }, [wallet.assets, prices]);

    const sortedAssets = useMemo(() => {
        const assetsToSort = [...displayableAssets]; // create a mutable copy
        if (sortDirection === null) {
            return assetsToSort; // Return in original order (by insertion)
        }

        assetsToSort.sort((a, b) => {
            const rankA = prices[a.id]?.market_cap_rank ?? Infinity;
            const rankB = prices[b.id]?.market_cap_rank ?? Infinity;
            
            if (rankA === Infinity && rankB === Infinity) return 0;
            if (rankA === Infinity) return 1; // Put assets without rank at the end
            if (rankB === Infinity) return -1;

            return sortDirection === 'asc' ? rankA - rankB : rankB - rankA;
        });

        return assetsToSort;
    }, [displayableAssets, prices, sortDirection]);

    const visibleAssets = useMemo(() => sortedAssets.slice(0, visibleCount), [sortedAssets, visibleCount]);

    const handleShowMore = () => {
        setVisibleCount(prevCount => prevCount + 10);
    };

    const handleHide = () => {
        setVisibleCount(10);
    };
    
    const hasMore = visibleCount < displayableAssets.length;
    const showHideButton = displayableAssets.length > 10 && !hasMore;

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg mb-8">
            <header className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-white">{wallet.name}</h3>
                    <p className="text-xl font-bold font-mono text-cyan-400 mt-1">{formattedValue}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => onAddAsset(wallet.id)} 
                        className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
                        aria-label={`Add asset to ${wallet.name}`}
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Add Asset</span>
                    </button>
                    <button 
                        onClick={() => onRemoveWallet(wallet.id)}
                        className="p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors duration-200"
                        aria-label={`Delete wallet ${wallet.name}`}
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </header>
            
            {displayableAssets.length > 0 ? (
                <>
                    <AssetTable 
                        assets={visibleAssets} 
                        prices={prices} 
                        onRemove={(assetId) => onRemoveAsset(wallet.id, assetId)}
                        onAddTransaction={(asset) => onAddTransaction(wallet.id, asset)}
                        sortDirection={sortDirection}
                        onSortChange={handleSortChange}
                    />
                    {(hasMore || showHideButton) && (
                        <div className="py-3 px-6 text-center border-t border-slate-700">
                            {hasMore && (
                                <button
                                    onClick={handleShowMore}
                                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-5 rounded-lg transition-colors duration-300 w-full sm:w-auto"
                                >
                                    Show More
                                </button>
                            )}
                            {showHideButton && (
                                <button
                                    onClick={handleHide}
                                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-5 rounded-lg transition-colors duration-300 w-full sm:w-auto"
                                >
                                    Hide
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="p-6 text-center text-slate-400">
                    <p>This wallet is empty.</p>
                    <p>Click 'Add Asset' to get started.</p>
                </div>
            )}
        </div>
    );
};

export default WalletCard;
