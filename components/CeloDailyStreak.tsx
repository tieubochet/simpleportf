import React from 'react';
import { useCeloStreak } from '../hooks/useCeloStreak';
import { WalletIcon } from './icons';

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
                    title="Connect Celo wallet to say GM"
                >
                    <WalletIcon className="h-5 w-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Celo'}</span>
                </button>
                 {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const isLoading = isInteracting || isConnecting;
    
    let buttonText = 'Celo GM';
    let title = "Say GM on Celo for today's streak";

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
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.419 12.428c0 5.24-4.26 9.5-9.5 9.5-5.24 0-9.5-4.26-9.5-9.5 0-5.24 4.26-9.5 9.5-9.5 5.24 0 9.5 4.26 9.5 9.5z" stroke="#35D07F" strokeWidth="2.5" strokeMiterlimit="10"></path><path d="M17.419 12.428a5.5 5.5 0 01-11 0 5.5 5.5 0 0111 0z" stroke="#35D07F" strokeWidth="2" strokeMiterlimit="10"></path></svg>
                <span className="font-bold">{streak}</span>
                <span>{buttonText}</span>
            </button>
            {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
        </div>
    );
};
