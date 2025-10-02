import React from 'react';
import { useHyperEvmStreak } from '../hooks/useHyperEvmStreak';

export const HyperEvmDailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useHyperEvmStreak();
    
    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/60";
    
    const buttonContent = (
        <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" stroke="#15803d" strokeWidth="2"/>
                <path d="M7 7V17M17 7V17M7 12H17" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-green-100 dark:ring-green-900/50">
                    {streak}
                </span>
            )}
        </>
    );

    const handleClick = isConnected ? checkInWithContract : connectWallet;
    const isLoading = isInteracting || isConnecting;
    
    let title = isConnected 
        ? `Daily Streak (HyperEVM): ${streak}. Click to check in.` 
        : "Connect HyperEVM wallet for daily streak";
    if (isConnecting) title = "Connecting to HyperEVM...";
    if (isInteracting) title = "Submitting check-in on HyperEVM...";
    if (error) title = `HyperEVM Streak Error: ${error}`;

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={iconButtonStyles}
            title={title}
            aria-label={title}
        >
            {buttonContent}
        </button>
    );
};
