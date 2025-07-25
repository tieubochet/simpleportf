
import React from 'react';
import { Wallet, PriceData } from '../types';
import AssetTable from './AssetTable';
import { PlusIcon, TrashIcon } from './icons';

interface WalletCardProps {
    wallet: Wallet;
    prices: PriceData;
    onAddAsset: (walletId: string) => void;
    onRemoveAsset: (walletId: string, assetId: string) => void;
    onRemoveWallet: (walletId: string) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, prices, onAddAsset, onRemoveAsset, onRemoveWallet }) => {
    
    const walletTotalValue = wallet.assets.reduce((acc, asset) => {
        const price = prices[asset.id]?.usd ?? 0;
        return acc + asset.amount * price;
    }, 0);
    
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(walletTotalValue);

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg mb-8">
            <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-white">{wallet.name}</h3>
                    <p className="text-slate-400 font-mono">{formattedValue}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => onAddAsset(wallet.id)} 
                        className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
                        aria-label={`Add asset to ${wallet.name}`}
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Add Asset</span>
                    </button>
                    <button 
                        onClick={() => onRemoveWallet(wallet.id)}
                        className="p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors duration-200"
                        aria-label={`Delete wallet ${wallet.name}`}
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            
            {wallet.assets.length > 0 ? (
                <AssetTable 
                    assets={wallet.assets} 
                    prices={prices} 
                    onRemove={(assetId) => onRemoveAsset(wallet.id, assetId)} 
                />
            ) : (
                <div className="p-6 text-center text-slate-400">
                    <p>This wallet is empty.</p>
                    <p>Click 'Add Asset' to get started.</p>
                </div>
            )}
        </div>
    );
};

export default WalletCard;