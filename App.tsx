
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PortfolioAsset, PriceData, Wallet, Transaction, PerformerData } from './types';
import { usePortfolio } from './hooks/usePortfolio';
import { useTheme } from './hooks/useTheme';
import { fetchPrices } from './services/coingecko';
import { calculateTotalValue, getAssetIds, getAssetMetrics, calculatePortfolio24hChange, calculateTotalPL, findTopPerformer, findTopLoser } from './utils/calculations';

import PortfolioHeader from './components/PortfolioHeader';
import PortfolioSummary from './components/PortfolioSummary';
import AddAssetModal from './components/AddAssetModal';
import AddWalletModal from './components/AddWalletModal';
import AddTransactionModal from './components/AddTransactionModal';
import WalletCard from './components/WalletCard';
import { WalletIcon } from './components/icons';
import AllocationChart from './components/AllocationChart';
import BackToTopButton from './components/BackToTopButton';

type AssetForTransaction = {
  walletId: string;
  asset: PortfolioAsset;
  currentQuantity: number;
  currentPrice: number;
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { wallets, addWallet, removeWallet, addAssetToWallet, removeAssetFromWallet, addTransactionToAsset, importWallets, exportWallets } = usePortfolio();
  
  const [prices, setPrices] = useState<PriceData>({});
  
  // Modal states
  const [addingAssetToWalletId, setAddingAssetToWalletId] = useState<string | null>(null);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [assetForTransaction, setAssetForTransaction] = useState<AssetForTransaction | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Privacy Mode State
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  const allAssetIds = useMemo(() => getAssetIds(wallets), [wallets]);

  const totalValue = useMemo(() => {
    return calculateTotalValue(wallets, prices);
  }, [wallets, prices]);
  
  const portfolio24hChange = useMemo(() => {
    return calculatePortfolio24hChange(wallets, prices);
  }, [wallets, prices]);

  const portfolioPL = useMemo(() => {
    return calculateTotalPL(wallets, prices);
  }, [wallets, prices]);

  const topPerformer = useMemo(() => {
    return findTopPerformer(wallets, prices);
  }, [wallets, prices]);
  
  const topLoser = useMemo(() => {
    return findTopLoser(wallets, prices);
  }, [wallets, prices]);

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyMode(prev => !prev);
  }, []);

  const updatePrices = useCallback(async () => {
    if (allAssetIds.length === 0) {
      setPrices({});
      setIsLoading(false);
      return;
    }
    setError(null);
    if (!isLoading) setIsLoading(true);
    try {
      const fetchedPrices = await fetchPrices(allAssetIds);
      setPrices(fetchedPrices);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      setError("Could not update prices. Please try again later.");
      // Clear the error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [allAssetIds, isLoading]);

  useEffect(() => {
    updatePrices();
    const interval = setInterval(updatePrices, 90000); // Update every 90 seconds to avoid rate limiting
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAssetIds.join(',')]); // Rerun when the list of assets changes
  

  const handleAddAsset = (asset: PortfolioAsset) => {
    if (addingAssetToWalletId) {
      addAssetToWallet(addingAssetToWalletId, asset);
      setAddingAssetToWalletId(null);
    }
  };
  
  const handleAddTransaction = (transaction: Transaction) => {
    if (assetForTransaction) {
      addTransactionToAsset(assetForTransaction.walletId, assetForTransaction.asset.id, transaction);
      setAssetForTransaction(null);
    }
  };

  const handleOpenAddAssetModal = (walletId: string) => {
    setAddingAssetToWalletId(walletId);
  };
  
  const handleOpenAddTransactionModal = (walletId: string, asset: PortfolioAsset) => {
    const currentPrice = prices[asset.id]?.usd ?? 0;
    const { currentQuantity } = getAssetMetrics(asset.transactions, currentPrice);
    setAssetForTransaction({ walletId, asset, currentQuantity, currentPrice });
  };

  const walletToAddAssetTo = useMemo(() => {
    if (!addingAssetToWalletId) return null;
    return wallets.find(w => w.id === addingAssetToWalletId);
  }, [addingAssetToWalletId, wallets]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <main className="container mx-auto p-4 md:p-8">
        <PortfolioHeader
          onAddWallet={() => setIsAddWalletModalOpen(true)}
          onImport={importWallets}
          onExport={exportWallets}
          isPrivacyMode={isPrivacyMode}
          onTogglePrivacyMode={togglePrivacyMode}
          theme={theme}
          onToggleTheme={toggleTheme}
          onRefresh={updatePrices}
          isRefreshing={isLoading}
        />

        <PortfolioSummary 
          totalValue={totalValue} 
          changeData={portfolio24hChange}
          plData={portfolioPL}
          performer={topPerformer}
          loser={topLoser}
          isLoading={isLoading && wallets.length > 0}
          isPrivacyMode={isPrivacyMode}
        />

        {error && <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg my-4">{error}</div>}

        {wallets.length > 0 ? (
          <>
            <div className="mt-8">
              <div className="max-w-3xl mx-auto">
                <AllocationChart 
                    wallets={wallets}
                    prices={prices}
                    isPrivacyMode={isPrivacyMode}
                    theme={theme}
                />
              </div>
            </div>

            <div className="mt-8">
              {wallets.map(wallet => (
                  <WalletCard 
                      key={wallet.id}
                      wallet={wallet}
                      prices={prices}
                      onAddAsset={handleOpenAddAssetModal}
                      onRemoveAsset={removeAssetFromWallet}
                      onRemoveWallet={removeWallet}
                      onAddTransaction={handleOpenAddTransactionModal}
                      isPrivacyMode={isPrivacyMode}
                  />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 px-6 bg-white dark:bg-slate-800 rounded-lg mt-8 shadow-md">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Your Portfolio is Empty</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Create a wallet to start tracking your assets.</p>
            <button
              onClick={() => setIsAddWalletModalOpen(true)}
              className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors duration-300 inline-flex items-center space-x-2"
            >
              <WalletIcon className="h-5 w-5" />
              <span>Create Your First Wallet</span>
            </button>
          </div>
        )}
      </main>

      {isAddWalletModalOpen && (
        <AddWalletModal 
          onClose={() => setIsAddWalletModalOpen(false)}
          onAddWallet={(name) => {
            addWallet(name);
            setIsAddWalletModalOpen(false);
          }}
        />
      )}

      {walletToAddAssetTo && (
        <AddAssetModal
          onClose={() => setAddingAssetToWalletId(null)}
          onAddAsset={handleAddAsset}
          existingAssetIds={walletToAddAssetTo.assets.map(a => a.id)}
        />
      )}
      
      {assetForTransaction && (
        <AddTransactionModal
          asset={assetForTransaction.asset}
          currentQuantity={assetForTransaction.currentQuantity}
          currentPrice={assetForTransaction.currentPrice}
          onClose={() => setAssetForTransaction(null)}
          onAddTransaction={handleAddTransaction}
        />
      )}

      <BackToTopButton />
    </div>
  );
}