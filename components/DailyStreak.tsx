
import React from 'react';
import { useWeb3Streak } from '../hooks/useWeb3Streak';
import { BoltIcon, WalletIcon } from './icons';

export const DailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        error,
        connectWallet,
        interactWithContract,
    } = useWeb3Streak();

    const commonButtonStyles = "flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed";

    if (!isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className={`${commonButtonStyles} bg-cyan-500 hover:bg-cyan-600 text-white`}
                    title="Connect wallet to interact with the contract"
                >
                    <WalletIcon className="h-5 w-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
                 {error && <p className="absolute top-full mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const isLoading = isInteracting;
    
    let buttonText = 'Interact';
    let title = "Interact with the smart contract";

    if (isLoading) {
        buttonText = 'Interacting...';
        title = "Processing transaction...";
    }

    return (
        <div className="relative">
            <button 
                onClick={interactWithContract} 
                className={`${commonButtonStyles} bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white`}
                title={title}
                disabled={isLoading}
            >
                <BoltIcon className="h-5 w-5" />
                <span>{buttonText}</span>
            </button>
            {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
        </div>
    );
};
