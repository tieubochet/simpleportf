
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PortfolioAsset, PriceData, Wallet, Transaction, PerformerData, GlobalData } from './types';
import { usePortfolio } from './hooks/usePortfolio';
import { fetchPrices, fetchGlobalData } from './services/coingecko';
import { calculateTotalValue, getAssetIds, getAssetMetrics, calculatePortfolio24hChange, calculateTotalPL, findTopPerformer } from './utils/calculations';

import GlobalStatsBar from './components/GlobalStatsBar';
import PortfolioHeader from './components/PortfolioHeader';
import PortfolioSummary from './components/PortfolioSummary';
import AllocationChart from './components/AllocationChart';
import AddAssetModal from './components/AddAssetModal';
import AddWalletModal from './components/AddWalletModal';
import AddTransactionModal from './components/AddTransactionModal';
import WalletCard from './components/WalletCard';
import TopPerformer from './components/TopPerformer';
import { WalletIcon } from './components/icons';

type AssetForTransaction = {
  walletId: string;
  asset: PortfolioAsset;
  currentQuantity: number;
}

export default function App() {
  const { wallets, addWallet, removeWallet, addAssetToWallet, removeAssetFromWallet, addTransactionToAsset, importWallets, exportWallets } = usePortfolio();
  
  const [prices, setPrices] = useState<PriceData>({});
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  
  // Modal states
  const [addingAssetToWalletId, setAddingAssetToWalletId] = useState<string | null>(null);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [assetForTransaction, setAssetForTransaction] = useState<AssetForTransaction | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    } finally {
      setIsLoading(false);
    }
  }, [allAssetIds, isLoading]);

  useEffect(() => {
    updatePrices();
    const interval = setInterval(updatePrices, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAssetIds.join(',')]); // Rerun when the list of assets changes
  
  useEffect(() => {
    const updateGlobalData = async () => {
      try {
        const data = await fetchGlobalData();
        setGlobalData(data);
      } catch (err) {
        console.error("Failed to fetch global data:", err);
        // Do not set a global error for this, as it's non-critical
      }
    };
    updateGlobalData();
    const interval = setInterval(updateGlobalData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

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
    const { currentQuantity } = getAssetMetrics(asset.transactions, 0); // Price is not needed for quantity
    setAssetForTransaction({ walletId, asset, currentQuantity });
  };

  const walletToAddAssetTo = useMemo(() => {
    if (!addingAssetToWalletId) return null;
    return wallets.find(w => w.id === addingAssetToWalletId);
  }, [addingAssetToWalletId, wallets]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <GlobalStatsBar globalData={globalData} />
      <main className="container mx-auto p-4 md:p-8">
        <PortfolioHeader
          onAddWallet={() => setIsAddWalletModalOpen(true)}
          onImport={importWallets}
          onExport={exportWallets}
        />

        <PortfolioSummary 
          totalValue={totalValue} 
          changeData={portfolio24hChange}
          plData={portfolioPL}
          isLoading={isLoading && wallets.length > 0} 
        />

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
                      onAddTransaction={handleOpenAddTransactionModal}
                  />
              ))}
            </div>
            <div className="lg:col-span-1 space-y-8">
              <AllocationChart wallets={wallets} prices={prices} />
              <TopPerformer performer={topPerformer} isLoading={isLoading && wallets.length > 0} />
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
      
      {assetForTransaction && (
        <AddTransactionModal
          asset={assetForTransaction.asset}
          currentQuantity={assetForTransaction.currentQuantity}
          onClose={() => setAssetForTransaction(null)}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </div>
  );
}