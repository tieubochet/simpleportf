import React, { useState, useEffect } from 'react';
import { Coin, PortfolioAsset } from '../types';
import { searchCoins } from '../services/coingecko';
import { SearchIcon, XIcon } from './icons';

interface AddAssetModalProps {
  onClose: () => void;
  onAddAsset: (asset: PortfolioAsset) => void;
  existingAssetIds: string[];
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ onClose, onAddAsset, existingAssetIds }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Enter Amount
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Coin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [amount, setAmount] = useState('');

  // The debounce logic is now handled inside useEffect, which is a more idiomatic React pattern.
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timerId = setTimeout(() => {
      searchCoins(searchQuery)
        .then(results => {
          // Filter out coins that are already in the portfolio
          const filteredResults = results.filter(coin => !existingAssetIds.includes(coin.id));
          setSearchResults(filteredResults);
        })
        .catch(error => {
          console.error("Failed to search for coins:", error);
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery, existingAssetIds]);

  const handleSelectCoin = (coin: Coin) => {
    setSelectedCoin(coin);
    setStep(2);
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (selectedCoin && !isNaN(numericAmount) && numericAmount > 0) {
      onAddAsset({
        id: selectedCoin.id,
        name: selectedCoin.name,
        symbol: selectedCoin.symbol,
        amount: numericAmount,
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {step === 1 ? 'Add New Asset' : `Add ${selectedCoin?.name}`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search for a cryptocurrency..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <div className="h-64 overflow-y-auto">
                {isSearching && <div className="text-center text-slate-400 p-4">Searching...</div>}
                {!isSearching && searchResults.length > 0 && (
                  <ul>
                    {searchResults.map(coin => (
                      <li key={coin.id} onClick={() => handleSelectCoin(coin)} className="flex items-center p-3 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors">
                        <div className="flex-grow">
                            <span className="font-semibold text-white">{coin.name}</span>
                            <span className="text-slate-400 ml-2 uppercase">{coin.symbol}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!isSearching && searchQuery.length > 1 && searchResults.length === 0 && (
                    <div className="text-center text-slate-400 p-4">No results found.</div>
                )}
              </div>
            </div>
          )}

          {step === 2 && selectedCoin && (
            <div>
              <p className="text-slate-400 mb-4">Enter the amount of {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()}) you hold.</p>
              <input
                type="number"
                placeholder="e.g., 0.5"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-800/50 border-t border-slate-700 rounded-b-lg flex justify-end space-x-4">
          {step === 2 && 
            <button onClick={() => setStep(1)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Back to Search
            </button>
          }
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Cancel
          </button>
          {step === 2 && 
            <button onClick={handleSave} disabled={!amount || parseFloat(amount) <= 0} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">
              Add Asset
            </button>
          }
        </div>
      </div>
    </div>
  );
};

export default AddAssetModal;
