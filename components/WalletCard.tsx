
import React, { useState, useMemo } from 'react';
import { Wallet, PriceData, PortfolioAsset } from '../types';
import AssetTable from './AssetTable';
import { PlusIcon, TrashIcon } from './icons';
import { calculateTotalValue, getAssetMetrics, calculateWallet24hChange } from '../utils/calculations';

type SortKey = 'rank' | 'change24h' | 'change7d' | 'pl' | 'value';

interface SortConfig {
    key: SortKey | null;
    direction: 'asc' | 'desc';
}

interface WalletCardProps {
    wallet: Wallet;
    prices: PriceData;
    onAddAsset: (walletId: string) => void;
    onRemoveAsset: (walletId: string, assetId: string) => void;
    onRemoveWallet: (walletId:string) => void;
    onAddTransaction: (walletId: string, asset: PortfolioAsset) => void;
    isPrivacyMode: boolean;
}

const WalletChangeDisplay: React.FC<{ value: number; percentage: number; isPrivacyMode: boolean }> = ({ value, percentage, isPrivacyMode }) => {
    const isPositive = value >= 0;
    const colorClass = isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const sign = isPositive ? '+' : '';

    if (isNaN(value) || isNaN(percentage) || Math.abs(value) < 0.01) {
        return <p className="text-sm font-mono text-slate-500 dark:text-slate-500"><span className="text-slate-500 dark:text-slate-400">24h:</span> -</p>;
    }

    if (isPrivacyMode) {
        return (
            <p className={`text-sm font-mono ${colorClass}`}>
                <span className="text-slate-500 dark:text-slate-400 mr-2">24h:</span> 
                {`$ **** (${sign}**.**%)`}
            </p>
        );
    }
    
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);

    const formattedPercentage = `(${sign}${Math.abs(percentage || 0).toFixed(2)}%)`;

    return (
        <p className={`text-sm font-mono ${colorClass}`}>
            <span className="text-slate-500 dark:text-slate-400 mr-2">24h:</span> 
            {formattedValue}
            <span className="ml-2">{formattedPercentage}</span>
        </p>
    );
};


const WalletCard: React.FC<WalletCardProps> = ({ wallet, prices, onAddAsset, onRemoveAsset, onRemoveWallet, onAddTransaction, isPrivacyMode }) => {
    
    const [visibleCount, setVisibleCount] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    const handleSortChange = (key: SortKey) => {
        setSortConfig(currentConfig => {
            // If it's a new column, set a default sort direction
            if (currentConfig.key !== key) {
                // Rank sorts asc (1, 2, 3), others sort desc (highest first)
                return { key, direction: key === 'rank' ? 'asc' : 'desc' };
            }
            // If it's the same column, cycle direction: desc -> asc -> null
            if (currentConfig.direction === 'desc') {
                return { key, direction: 'asc' };
            }
            // Last step in cycle, remove sort
            return { key: null, direction: 'asc' }; // Reset to default
        });
    };

    const walletTotalValue = useMemo(() => calculateTotalValue([wallet], prices), [wallet, prices]);
    const wallet24hChange = useMemo(() => calculateWallet24hChange(wallet, prices), [wallet, prices]);
    
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(walletTotalValue);
    
    const displayableAssets = useMemo(() => {
        return wallet.assets.filter(asset => {
            const { currentQuantity } = getAssetMetrics(asset.transactions, prices[asset.id]?.usd ?? 0);
            return currentQuantity > 0;
        });
    }, [wallet.assets, prices]);

    const sortedAssets = useMemo(() => {
        const assetsToSort = [...displayableAssets];
        const { key, direction } = sortConfig;

        if (key === null) {
            // Default sort by market value desc
            return assetsToSort.sort((a,b) => {
                 const metricsA = getAssetMetrics(a.transactions, prices[a.id]?.usd ?? 0);
                 const metricsB = getAssetMetrics(b.transactions, prices[b.id]?.usd ?? 0);
                 return metricsB.marketValue - metricsA.marketValue;
            });
        }

        assetsToSort.sort((a, b) => {
            let valA: number;
            let valB: number;

            switch (key) {
                case 'rank':
                    valA = prices[a.id]?.market_cap_rank ?? Infinity;
                    valB = prices[b.id]?.market_cap_rank ?? Infinity;
                    break;
                case 'change24h':
                    valA = prices[a.id]?.usd_24h_change ?? -Infinity;
                    valB = prices[b.id]?.usd_24h_change ?? -Infinity;
                    break;
                case 'change7d':
                    valA = prices[a.id]?.usd_7d_change ?? -Infinity;
                    valB = prices[b.id]?.usd_7d_change ?? -Infinity;
                    break;
                case 'pl':
                    const metricsA = getAssetMetrics(a.transactions, prices[a.id]?.usd ?? 0);
                    const metricsB = getAssetMetrics(b.transactions, prices[b.id]?.usd ?? 0);
                    valA = metricsA.unrealizedPL;
                    valB = metricsB.unrealizedPL;
                    break;
                case 'value':
                    const metricsA_val = getAssetMetrics(a.transactions, prices[a.id]?.usd ?? 0);
                    const metricsB_val = getAssetMetrics(b.transactions, prices[b.id]?.usd ?? 0);
                    valA = metricsA_val.marketValue;
                    valB = metricsB_val.marketValue;
                    break;
                default:
                    return 0;
            }

            if (valA === valB) return 0;
            
            // Special handling for infinity to keep un-ranked/un-priced items at the bottom
            if (valA === Infinity || valA === -Infinity) return 1;
            if (valB === Infinity || valB === -Infinity) return -1;

            const order = valA > valB ? 1 : -1;
            return direction === 'asc' ? order : -order;
        });

        return assetsToSort;
    }, [displayableAssets, prices, sortConfig]);

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
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md mb-8">
            <header className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{wallet.name}</h3>
                    <p className="text-xl font-bold font-mono text-cyan-500 dark:text-cyan-400 mt-1">{isPrivacyMode ? '$ ****' : formattedValue}</p>
                    <div className="mt-1">
                        <WalletChangeDisplay
                            value={wallet24hChange.changeValue}
                            percentage={wallet24hChange.changePercentage}
                            isPrivacyMode={isPrivacyMode}
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => onAddAsset(wallet.id)} 
                        className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
                        aria-label={`Add asset to ${wallet.name}`}
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Add Asset</span>
                    </button>
                    <button 
                        onClick={() => onRemoveWallet(wallet.id)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors duration-200"
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
                        sortConfig={sortConfig}
                        onSortChange={handleSortChange}
                        isPrivacyMode={isPrivacyMode}
                    />
                    {(hasMore || showHideButton) && (
                        <div className="py-3 px-6 text-center border-t border-slate-200 dark:border-slate-700">
                            {hasMore && (
                                <button
                                    onClick={handleShowMore}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 font-semibold py-2 px-5 rounded-lg transition-colors duration-300 w-full sm:w-auto"
                                >
                                    Show More
                                </button>
                            )}
                            {showHideButton && (
                                <button
                                    onClick={handleHide}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 font-semibold py-2 px-5 rounded-lg transition-colors duration-300 w-full sm:w-auto"
                                >
                                    Hide
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    <p>This wallet is empty.</p>
                    <p>Click 'Add Asset' to get started.</p>
                </div>
            )}
        </div>
    );
};

export default WalletCard;