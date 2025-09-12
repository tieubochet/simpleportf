import React from 'react';
import { useCeloStreak } from '../hooks/useCeloStreak';
import { FireIcon, WalletIcon } from './icons';

export const CeloDailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useCeloStreak();

    const commonButtonStyles = "flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed";

    if (!isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className={`${commonButtonStyles} bg-emerald-500 hover:bg-emerald-600 text-white`}
                    title="Connect Celo wallet to check in"
                >
                    <WalletIcon className="h-5 w-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Celo'}</span>
                </button>
                 {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const isLoading = isInteracting || isConnecting;
    
    let buttonText = 'Check In (Celo)';
    let title = "Check in for today's Celo streak";

    if (isLoading) {
        buttonText = 'Processing...';
        title = "Processing transaction...";
    }

    return (
        <div className="relative">
            <button 
                onClick={checkInWithContract} 
                className={`${commonButtonStyles} bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white`}
                title={title}
                disabled={isLoading}
            >
                <FireIcon className="h-5 w-5 text-green-400" />
                <span className="font-bold">{streak}</span>
                <span>{buttonText}</span>
            </button>
            {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
        </div>
    );
};
