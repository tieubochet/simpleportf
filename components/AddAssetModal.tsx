
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Coin, PortfolioAsset, Transaction } from '../types';
import { searchCoins } from '../services/coingecko';
import { SearchIcon, XIcon } from './icons';

interface AddAssetModalProps {
  onClose: () => void;
  onAddAsset: (asset: PortfolioAsset) => void;
  existingAssetIds: string[];
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ onClose, onAddAsset, existingAssetIds }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Enter First Transaction
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Coin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchQuery, existingAssetIds]);

  const handleSelectCoin = (coin: Coin) => {
    setSelectedCoin(coin);
    setStep(2);
  };

  const handleSave = () => {
    const numericQuantity = parseFloat(quantity);
    const numericPrice = parseFloat(pricePerUnit);
    if (selectedCoin && !isNaN(numericQuantity) && numericQuantity > 0 && !isNaN(numericPrice) && numericPrice >= 0 && !!date) {
      const firstTransaction: Transaction = {
        id: uuidv4(),
        type: 'buy',
        quantity: numericQuantity,
        pricePerUnit: numericPrice,
        date: new Date(date).toISOString(),
      };
      
      const newAsset: PortfolioAsset = {
        id: selectedCoin.id,
        name: selectedCoin.name,
        symbol: selectedCoin.symbol,
        transactions: [firstTransaction],
      };

      onAddAsset(newAsset);
    }
  };

  const canSave = parseFloat(quantity) > 0 && parseFloat(pricePerUnit) >= 0 && !!date;

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
                  autoFocus
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
                    <div className="text-center text-slate-400 p-4">No results found or asset already in wallet.</div>
                )}
              </div>
            </div>
          )}

          {step === 2 && selectedCoin && (
            <div className="space-y-4">
              <p className="text-slate-400">Enter the details of your first purchase of {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()}).</p>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  placeholder="e.g., 0.5"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Price Per Coin (USD)</label>
                <input
                  type="number"
                  placeholder="e.g., 50000.00"
                  value={pricePerUnit}
                  onChange={e => setPricePerUnit(e.target.value)}
                  className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="purchase-date" className="block text-sm font-medium text-slate-300 mb-1">Purchase Date</label>
                <input
                  id="purchase-date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
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
            <button onClick={handleSave} disabled={!canSave} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed">
              Add Asset
            </button>
          }
        </div>
      </div>
    </div>
  );
};

export default AddAssetModal;