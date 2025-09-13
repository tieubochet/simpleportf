
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Wallet, PriceData, PortfolioAsset, Transaction, Coin, MarketIndicesData } from './types';
import { usePortfolio } from './hooks/usePortfolio';
import { useTheme } from './hooks/useTheme';
import { fetchPrices } from './services/coingecko';
import { fetchMarketIndices } from './services/marketData';
import { calculateTotalValue, calculatePortfolio24hChange, calculateTotalPL, getAssetIds, findTopPerformer, findTopLoser, getAssetMetrics } from './utils/calculations';

import PortfolioHeader from './components/PortfolioHeader';
import PortfolioSummary from './components/PortfolioSummary';
import AllocationChart from './components/AllocationChart';
import WalletCard from './components/WalletCard';
import AddWalletModal from './components/AddWalletModal';
import AddAssetModal from './components/AddAssetModal';
import AddTransactionModal from './components/AddTransactionModal';
import BackToTopButton from './components/BackToTopButton';
import MarketIndices from './components/MarketIndices';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { wallets, addWallet, removeWallet, addAssetToWallet, addTransactionToAsset, removeAssetFromWallet, importWallets, exportWallets } = usePortfolio();
  
  const [prices, setPrices] = useState<PriceData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<{ walletId: string, asset: PortfolioAsset } | null>(null);
  
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  const [marketIndices, setMarketIndices] = useState<MarketIndicesData | null>(null);
  const [isMarketIndicesLoading, setIsMarketIndicesLoading] = useState(true);

  const assetIds = useMemo(() => getAssetIds(wallets), [wallets]);
  const existingAssetIdsInSelectedWallet = useMemo(() => {
    if (!selectedWalletId) return [];
    const wallet = wallets.find(w => w.id === selectedWalletId);
    return wallet ? wallet.assets.map(a => a.id) : [];
  }, [wallets, selectedWalletId]);

  const updatePrices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    if (assetIds.length > 0) {
      try {
        const fetchedPrices = await fetchPrices(assetIds);
        setPrices(fetchedPrices);
      } catch (err) {
        console.error("Failed to fetch prices:", err);
      }
    }
    setIsLoading(false);
    if (isRefresh) setIsRefreshing(false);
  }, [assetIds]);
  
  const updateMarketIndices = useCallback(async () => {
      setIsMarketIndicesLoading(true);
      try {
          const data = await fetchMarketIndices();
          setMarketIndices(data);
      } catch (err) {
          console.error("Failed to fetch market indices:", err);
          setMarketIndices(null);
      } finally {
          setIsMarketIndicesLoading(false);
      }
  }, []);

  useEffect(() => {
    updatePrices();
    const priceInterval = setInterval(updatePrices, 300000); // 5 minutes
    return () => clearInterval(priceInterval);
  }, [updatePrices]);
  
  useEffect(() => {
      updateMarketIndices();
      const interval = setInterval(updateMarketIndices, 300000); // Update every 5 minutes
      return () => clearInterval(interval);
  }, [updateMarketIndices]);

  const totalValue = useMemo(() => calculateTotalValue(wallets, prices), [wallets, prices]);
  const portfolioChange = useMemo(() => calculatePortfolio24hChange(wallets, prices), [wallets, prices]);
  const totalPL = useMemo(() => calculateTotalPL(wallets, prices), [wallets, prices]);
  const topPerformer = useMemo(() => findTopPerformer(wallets, prices), [wallets, prices]);
  const topLoser = useMemo(() => findTopLoser(wallets, prices), [wallets, prices]);

  const handleAddAssetClick = (walletId: string) => {
    setSelectedWalletId(walletId);
    setIsAddAssetModalOpen(true);
  };

  const handleAddAsset = (asset: PortfolioAsset) => {
    if (selectedWalletId) {
      addAssetToWallet(selectedWalletId, asset);
    }
    setIsAddAssetModalOpen(false);
    setSelectedWalletId(null);
  };
  
  const handleAddTransactionClick = (walletId: string, asset: PortfolioAsset) => {
    setSelectedAsset({ walletId, asset });
    setIsAddTxModalOpen(true);
  };
  
  const handleAddTransaction = (transaction: Transaction) => {
    if (selectedAsset) {
      addTransactionToAsset(selectedAsset.walletId, selectedAsset.asset.id, transaction);
    }
    setIsAddTxModalOpen(false);
    setSelectedAsset(null);
  };

  const selectedAssetMetrics = useMemo(() => {
    if (!selectedAsset) return { currentQuantity: 0, currentPrice: 0 };
    const price = prices[selectedAsset.asset.id]?.usd ?? 0;
    const { currentQuantity } = getAssetMetrics(selectedAsset.asset.transactions, price);
    return { currentQuantity, currentPrice: price };
  }, [selectedAsset, prices]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <main className="container mx-auto p-4 md:p-8">
        <PortfolioHeader 
          onAddWallet={() => setIsAddWalletModalOpen(true)}
          onImport={importWallets}
          onExport={exportWallets}
          isPrivacyMode={isPrivacyMode}
          onTogglePrivacyMode={() => setIsPrivacyMode(p => !p)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onRefresh={() => { updatePrices(true); updateMarketIndices(); }}
          isRefreshing={isRefreshing || isMarketIndicesLoading}
        />
        <div className="mb-8">
          <PortfolioSummary 
            totalValue={totalValue}
            changeData={portfolioChange}
            plData={totalPL}
            performer={topPerformer}
            loser={topLoser}
            isLoading={isLoading && wallets.length > 0}
            isPrivacyMode={isPrivacyMode}
          />
        </div>
        
        <div className="my-8">
            <MarketIndices data={marketIndices} isLoading={isMarketIndicesLoading} />
        </div>
        
        {wallets.length > 0 && (
          <div className="my-8">
            <AllocationChart wallets={wallets} prices={prices} isPrivacyMode={isPrivacyMode} theme={theme} />
          </div>
        )}

        <div>
          {wallets.length > 0 ? (
            wallets.map(wallet => (
              <WalletCard 
                key={wallet.id}
                wallet={wallet}
                prices={prices}
                onAddAsset={handleAddAssetClick}
                onRemoveAsset={removeAssetFromWallet}
                onRemoveWallet={removeWallet}
                onAddTransaction={handleAddTransactionClick}
                isPrivacyMode={isPrivacyMode}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Welcome to your Portfolio!</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Create a wallet to start adding your crypto assets.</p>
            </div>
          )}
        </div>
      </main>
      
      {isAddWalletModalOpen && <AddWalletModal onClose={() => setIsAddWalletModalOpen(false)} onAddWallet={addWallet} />}
      {isAddAssetModalOpen && selectedWalletId && <AddAssetModal onClose={() => setIsAddAssetModalOpen(false)} onAddAsset={handleAddAsset} existingAssetIds={existingAssetIdsInSelectedWallet} />}
      {isAddTxModalOpen && selectedAsset && <AddTransactionModal onClose={() => setIsAddTxModalOpen(false)} asset={selectedAsset.asset} onAddTransaction={handleAddTransaction} currentQuantity={selectedAssetMetrics.currentQuantity} currentPrice={selectedAssetMetrics.currentPrice} />}
      
      <BackToTopButton />
    </div>
  );
}
