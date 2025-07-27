
import React, { useState } from 'react';
import { XIcon } from './icons';

interface AddWalletModalProps {
  onClose: () => void;
  onAddWallet: (name: string) => void;
}

const AddWalletModal: React.FC<AddWalletModalProps> = ({ onClose, onAddWallet }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onAddWallet(name.trim());
      onClose();
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Wallet</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <label htmlFor="wallet-name" className="block text-slate-600 dark:text-slate-400 mb-2">Wallet Name</label>
          <input
            id="wallet-name"
            type="text"
            placeholder="e.g., Binance, Ledger, DeFi..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg flex justify-end space-x-4">
          <button onClick={onClose} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!name.trim()} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:text-slate-600 dark:disabled:text-slate-500 disabled:cursor-not-allowed">
            Create Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWalletModal;
