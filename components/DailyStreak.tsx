import React from 'react';
import { useWeb3Streak } from '../hooks/useWeb3Streak';
import { FireIcon, WalletIcon } from './icons';

export const DailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isClaiming,
        streakCount,
        canClaim,
        error,
        connectWallet,
        claimStreak,
    } = useWeb3Streak();

    const isLoading = isConnecting || isClaiming;
    const commonButtonStyles = "flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed";

    const handleClick = () => {
        if (!isConnected) {
            connectWallet();
        } else if (canClaim) {
            claimStreak();
        }
    };
    
    if (!isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={handleClick}
                    disabled={isLoading}
                    className={`${commonButtonStyles} bg-cyan-500 hover:bg-cyan-600 text-white`}
                    title="Connect wallet to track your streak on-chain"
                >
                    <WalletIcon className="h-5 w-5" />
                    <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
                 {error && <p className="absolute top-full mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const pulseAnimation = canClaim && !isLoading ? 'animate-pulse' : '';
    const buttonColors = "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600";
    const title = isLoading ? "Processing..." : (canClaim ? "Click to claim your daily streak!" : `Current streak: ${streakCount} days. Come back tomorrow!`);

    return (
        <div className="relative">
            <button 
                onClick={handleClick} 
                className={`${commonButtonStyles} text-amber-500 dark:text-amber-400 ${buttonColors} ${pulseAnimation}`}
                title={title}
                disabled={!canClaim || isLoading}
            >
                <FireIcon className="h-5 w-5" />
                <span>{isClaiming ? 'Claiming...' : streakCount}</span>
            </button>
            {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
        </div>
    );
};