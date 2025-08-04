
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PortfolioAsset, PriceData, Wallet, Transaction, HistoricalDataPoint, PerformerData } from './types';
import { usePortfolio } from './hooks/usePortfolio';
import { fetchPrices, fetchHistoricalChartData } from './services/coingecko';
import { calculateTotalValue, getAssetIds, getAssetMetrics, calculatePortfolio24hChange, calculateTotalPL, calculateHistoricalPortfolioValue, findTopPerformer, findTopLoser } from './utils/calculations';

import PortfolioHeader from './components/PortfolioHeader';
import PortfolioSummary from './components/PortfolioSummary';
import AddAssetModal from './components/AddAssetModal';
import AddWalletModal from './components/AddWalletModal';
import AddTransactionModal from './components/AddTransactionModal';
import WalletCard from './components/WalletCard';
import { WalletIcon } from './components/icons';
import PerformanceChart from './components/PerformanceChart';
import AllocationChart from './components/AllocationChart';
import BackToTopButton from './components/BackToTopButton';

type AssetForTransaction = {
  walletId: string;
  asset: PortfolioAsset;
  currentQuantity: number;
  currentPrice: number;
}

export default function App() {
  const { wallets, addWallet, removeWallet, addAssetToWallet, removeAssetFromWallet, addTransactionToAsset, importWallets, exportWallets } = usePortfolio();
  
  const [prices, setPrices] = useState<PriceData>({});
  
  // Modal states
  const [addingAssetToWalletId, setAddingAssetToWalletId] = useState<string | null>(null);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [assetForTransaction, setAssetForTransaction] = useState<AssetForTransaction | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Performance Chart State
  const [timeRange, setTimeRange] = useState<'4h' | '24h' | '7d'>('7d');
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [btcHistoricalData, setBtcHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);

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
  
  // Effect for fetching historical data for the chart
  useEffect(() => {
    const fetchAndCalculateHistoricalData = async () => {
        if (allAssetIds.length === 0) {
            setHistoricalData([]);
            setBtcHistoricalData([]);
            setIsChartLoading(false);
            return;
        }

        setIsChartLoading(true);
        try {
            const daysMap: { [key: string]: string } = { '4h': '1', '24h': '1', '7d': '7' };
            const days = daysMap[timeRange];

            const portfolioPromises = allAssetIds.map(id => fetchHistoricalChartData(id, days));
            const btcPromise = fetchHistoricalChartData('bitcoin', days);

            const [portfolioResults, btcResult] = await Promise.all([
              Promise.allSettled(portfolioPromises),
              btcPromise.catch(e => {
                  console.warn("Could not fetch BTC historical data", e);
                  return null; // Return null on failure
              })
            ]);

            const historicalPrices: Record<string, [number, number][]> = {};
            portfolioResults.forEach((result, index) => {
              const id = allAssetIds[index];
              if (result.status === 'fulfilled' && result.value) {
                historicalPrices[id] = result.value;
              } else if (result.status === 'rejected') {
                console.warn(`Failed to fetch historical data for ${id}:`, result.reason);
              }
            });

            let calculatedData = calculateHistoricalPortfolioValue(wallets, historicalPrices);
            
            if (timeRange === '4h') {
                const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
                calculatedData = calculatedData.filter(point => point[0] >= fourHoursAgo);
            }

            setHistoricalData(calculatedData);
            setBtcHistoricalData(btcResult || []);

        } catch (err) {
            console.error("An unexpected error occurred while processing historical chart data:", err);
            setHistoricalData([]);
            setBtcHistoricalData([]);
        } finally {
            setIsChartLoading(false);
        }
    };

    fetchAndCalculateHistoricalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, timeRange, allAssetIds.join(',')]);

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
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <PortfolioHeader
          onAddWallet={() => setIsAddWalletModalOpen(true)}
          onImport={importWallets}
          onExport={exportWallets}
          isPrivacyMode={isPrivacyMode}
          onTogglePrivacyMode={togglePrivacyMode}
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
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <PerformanceChart 
                    portfolioData={historicalData} 
                    btcData={btcHistoricalData}
                    isLoading={isChartLoading}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    isPrivacyMode={isPrivacyMode}
                />
              </div>
              <div className="lg:col-span-2">
                <AllocationChart 
                    wallets={wallets}
                    prices={prices}
                    isPrivacyMode={isPrivacyMode}
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
          currentPrice={assetForTransaction.currentPrice}
          onClose={() => setAssetForTransaction(null)}
          onAddTransaction={handleAddTransaction}
        />
      )}

      <BackToTopButton />
    </div>
  );
}