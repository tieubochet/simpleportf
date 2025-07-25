import { useState, useEffect, useCallback } from 'react';
import { PortfolioAsset, Wallet, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'cryptoPortfolioWallets_v2'; // New key for the new data structure

// Helper to get initial state from localStorage
const getInitialState = (): Wallet[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Basic validation for the new structure
      if (Array.isArray(parsed) && (parsed.length === 0 || parsed.every(w => 'id' in w && 'name' in w && 'assets' in w && Array.isArray(w.assets)))) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load wallets from localStorage", error);
  }
  return [];
};

export function usePortfolio() {
  const [wallets, setWallets] = useState<Wallet[]>(getInitialState);

  // Persist wallets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
    } catch (error) {
      console.error("Failed to save wallets to localStorage", error);
    }
  }, [wallets]);
  
  const addWallet = useCallback((name: string) => {
    if (!name.trim()) return;
    const newWallet: Wallet = {
      id: uuidv4(),
      name: name.trim(),
      assets: [],
    };
    setWallets(prev => [...prev, newWallet]);
  }, []);

  const removeWallet = useCallback((walletId: string) => {
    if (window.confirm("Are you sure you want to delete this wallet and all its assets? This action cannot be undone.")) {
      setWallets(prev => prev.filter(w => w.id !== walletId));
    }
  }, []);

  const addAssetToWallet = useCallback((walletId: string, newAsset: PortfolioAsset) => {
    setWallets(prevWallets => 
      prevWallets.map(wallet => {
        if (wallet.id === walletId) {
          // Since this function is for adding a *new* asset, we assume it doesn't exist yet.
          // The logic to add transactions to an *existing* asset is separate.
          return { ...wallet, assets: [...wallet.assets, newAsset] };
        }
        return wallet;
      })
    );
  }, []);

  const addTransactionToAsset = useCallback((walletId: string, assetId: string, transaction: Transaction) => {
      setWallets(prevWallets =>
          prevWallets.map(wallet => {
              if (wallet.id === walletId) {
                  const updatedAssets = wallet.assets.map(asset => {
                      if (asset.id === assetId) {
                          // Add the new transaction to the existing asset
                          return {
                              ...asset,
                              transactions: [...asset.transactions, transaction],
                          };
                      }
                      return asset;
                  });
                  return { ...wallet, assets: updatedAssets };
              }
              return wallet;
          })
      );
  }, []);

  const removeAssetFromWallet = useCallback((walletId: string, assetId: string) => {
    // Confirmation is now more specific because this is a destructive action
    if (window.confirm("Are you sure you want to remove this asset and all of its transaction history?")) {
        setWallets(prevWallets => 
        prevWallets.map(wallet => {
            if (wallet.id === walletId) {
            return {
                ...wallet,
                assets: wallet.assets.filter(asset => asset.id !== assetId),
            };
            }
            return wallet;
        })
        );
    }
  }, []);

  const exportWallets = useCallback(() => {
    if (wallets.length === 0) {
      alert("Portfolio is empty. Nothing to export.");
      return;
    }
    const dataStr = JSON.stringify(wallets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `crypto-portfolio-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [wallets]);

  const importWallets = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          try {
            const importedData = JSON.parse(event.target?.result as string);
            // Basic validation for the new transaction-based structure
            const isValidNewFormat = Array.isArray(importedData) && 
              (importedData.length === 0 || 
               importedData.every(w => 'id' in w && 'name' in w && 'assets' in w && 
                 Array.isArray(w.assets) && w.assets.every((a: any) => 'transactions' in a && Array.isArray(a.transactions))
               )
              );

            if (isValidNewFormat) {
              if (window.confirm("This will replace your current portfolio. Are you sure?")) {
                setWallets(importedData);
              }
            } else {
              alert('Invalid portfolio file format. The file must contain wallets with transaction data.');
            }
          } catch (error) {
            alert('Error reading or parsing the file.');
            console.error(error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  return { wallets, addWallet, removeWallet, addAssetToWallet, addTransactionToAsset, removeAssetFromWallet, importWallets, exportWallets };
}