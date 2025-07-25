
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PortfolioAsset, PriceData, Wallet } from './types';
import { usePortfolio } from './hooks/usePortfolio';
import { fetchPrices } from './services/coingecko';

import PortfolioHeader from './components/PortfolioHeader';
import PortfolioSummary from './components/PortfolioSummary';
import AllocationChart from './components/AllocationChart';
import AddAssetModal from './components/AddAssetModal';
import AddWalletModal from './components/AddWalletModal';
import WalletCard from './components/WalletCard';
import { WalletIcon } from './components/icons';

export default function App() {
  const { wallets, addWallet, removeWallet, addAssetToWallet, removeAssetFromWallet, importWallets, exportWallets } = usePortfolio();
  
  const [prices, setPrices] = useState<PriceData>({});
  
  // Modal states
  const [addingAssetToWalletId, setAddingAssetToWalletId] = useState<string | null>(null);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get a flat list of all unique asset IDs from all wallets
  const allAssetIds = useMemo(() => {
    const ids = new Set<string>();
    wallets.forEach(w => w.assets.forEach(a => ids.add(a.id)));
    return Array.from(ids);
  }, [wallets]);

  const totalValue = useMemo(() => {
    return wallets.reduce((total, wallet) => {
      return total + wallet.assets.reduce((walletTotal, asset) => {
        const price = prices[asset.id]?.usd ?? 0;
        return walletTotal + asset.amount * price;
      }, 0);
    }, 0);
  }, [wallets, prices]);

  const updatePrices = useCallback(async () => {
    if (allAssetIds.length === 0) {
      setPrices({});
      setIsLoading(false);
      return;
    }
    setError(null);
    !isLoading && setIsLoading(true);
    try {
      const fetchedPrices = await fetchPrices(allAssetIds);
      setPrices(fetchedPrices);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      setError("Could not update prices. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [allAssetIds, isLoading]);

  useEffect(() => {
    updatePrices();
    const interval = setInterval(updatePrices, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAssetIds]); // Rerun when allAssetIds change
  
  const handleAddAsset = (asset: PortfolioAsset) => {
    if (addingAssetToWalletId) {
      addAssetToWallet(addingAssetToWalletId, asset);
      setAddingAssetToWalletId(null);
    }
  };

  const handleOpenAddAssetModal = (walletId: string) => {
    setAddingAssetToWalletId(walletId);
  };

  const walletToAddAssetTo = useMemo(() => {
    if (!addingAssetToWalletId) return null;
    return wallets.find(w => w.id === addingAssetToWalletId);
  }, [addingAssetToWalletId, wallets]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <PortfolioHeader
          onAddWallet={() => setIsAddWalletModalOpen(true)}
          onImport={importWallets}
          onExport={exportWallets}
        />

        <PortfolioSummary totalValue={totalValue} isLoading={isLoading && wallets.length > 0} />

        {error && <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg my-4">{error}</div>}

        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              {wallets.map(wallet => (
                  <WalletCard 
                      key={wallet.id}
                      wallet={wallet}
                      prices={prices}
                      onAddAsset={handleOpenAddAssetModal}
                      onRemoveAsset={removeAssetFromWallet}
                      onRemoveWallet={removeWallet}
                  />
              ))}
            </div>
            <div className="lg:col-span-1">
              <AllocationChart wallets={wallets} prices={prices} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-slate-800 rounded-lg mt-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Your Portfolio is Empty</h2>
            <p className="text-slate-400 mb-6">Create a wallet to start tracking your assets.</p>
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
    </div>
  );
}