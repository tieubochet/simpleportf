
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PortfolioAsset, Transaction } from '../types';
import { XIcon } from './icons';

interface AddTransactionModalProps {
  asset: PortfolioAsset;
  currentQuantity: number;
  currentPrice: number;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
}

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
    }).format(value);
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ asset, currentQuantity, currentPrice, onClose, onAddTransaction }) => {
  const [type, setType] = useState<'buy' | 'sell' | 'transfer_in' | 'transfer_out'>('buy');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [fee, setFee] = useState('');

  const isTransfer = type === 'transfer_in' || type === 'transfer_out';
  const isDebit = type === 'sell' || type === 'transfer_out';
  const exceedsBalance = isDebit && parseFloat(quantity) > currentQuantity;

  const canSave = parseFloat(quantity) > 0 && !!date && !exceedsBalance && (isTransfer || parseFloat(pricePerUnit) >= 0);

  const handleSave = () => {
    if (!canSave) return;

    const numericFee = fee ? parseFloat(fee) : 0;

    onAddTransaction({
      id: uuidv4(),
      type,
      quantity: parseFloat(quantity),
      pricePerUnit: isTransfer ? 0 : parseFloat(pricePerUnit || '0'),
      date: new Date(date).toISOString(),
      notes: notes.trim() ? notes.trim() : undefined,
      fee: numericFee > 0 ? numericFee : undefined,
    });
    onClose();
  };

  const commonButtonClasses = 'relative inline-flex items-center justify-center w-full px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors';
  const inactiveButtonClasses = 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600';

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
          <h2 className="text-xl font-bold text-white">Add Transaction for {asset.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 rounded-md shadow-sm">
                    <button
                        type="button"
                        onClick={() => setType('buy')}
                        className={`${commonButtonClasses} rounded-tl-md ${type === 'buy' ? 'bg-cyan-500 text-white border-cyan-500' : inactiveButtonClasses}`}
                    >
                        Buy
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('sell')}
                        className={`${commonButtonClasses} rounded-tr-md -ml-px ${type === 'sell' ? 'bg-pink-500 text-white border-pink-500' : inactiveButtonClasses}`}
                    >
                        Sell
                    </button>
                     <button
                        type="button"
                        onClick={() => setType('transfer_in')}
                        className={`${commonButtonClasses} rounded-bl-md -mt-px ${type === 'transfer_in' ? 'bg-emerald-500 text-white border-emerald-500' : inactiveButtonClasses}`}
                    >
                        Transfer In
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('transfer_out')}
                        className={`${commonButtonClasses} rounded-br-md -ml-px -mt-px ${type === 'transfer_out' ? 'bg-amber-500 text-white border-amber-500' : inactiveButtonClasses}`}
                    >
                        Transfer Out
                    </button>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="tx-quantity" className="block text-sm font-medium text-slate-300">Quantity</label>
                    {isDebit && (
                        <button 
                            type="button"
                            onClick={() => setQuantity(String(currentQuantity))}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                            title="Set to max available amount"
                        >
                            Available: {formatNumber(currentQuantity)}
                        </button>
                    )}
                </div>
                <input
                    id="tx-quantity"
                    type="number"
                    placeholder="e.g., 1.25"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    autoFocus
                    className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {exceedsBalance && (
                    <p className="text-red-500 text-xs mt-1">Amount exceeds available balance.</p>
                )}
            </div>
             {!isTransfer && (
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="tx-price" className="block text-sm font-medium text-slate-300">Price Per Coin (USD)</label>
                        {currentPrice > 0 && (
                            <button
                                type="button"
                                onClick={() => setPricePerUnit(String(currentPrice))}
                                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                                title="Use current market price"
                            >
                                Current: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </button>
                        )}
                    </div>
                    <input
                        id="tx-price"
                        type="number"
                        placeholder="e.g., 60000.00"
                        value={pricePerUnit}
                        onChange={e => setPricePerUnit(e.target.value)}
                        className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
             )}
            <div>
              <label htmlFor="tx-fee" className="block text-sm font-medium text-slate-300 mb-1">Fee (USD) (Optional)</label>
              <input
                  id="tx-fee"
                  type="number"
                  placeholder="e.g., 1.49"
                  value={fee}
                  onChange={e => setFee(e.target.value)}
                  className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
                <label htmlFor="tx-date" className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                <input
                    id="tx-date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
             <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">Notes (Optional)</label>
                <textarea
                  id="notes"
                  placeholder="e.g., Taking profits"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
        </div>

        <div className="p-6 bg-slate-800/50 border-t border-slate-700 rounded-b-lg flex justify-end space-x-4">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!canSave} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed">
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;