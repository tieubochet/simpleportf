import React from 'react';
import { useOpStreak } from '../hooks/useOpStreak';

export const OpDailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useOpStreak();
    
    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/60";
    
    const buttonContent = (
        <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#FF0420" strokeWidth="2"/>
                <path d="M15.5 8.5C15.5 8.5 15 12 12 12C9 12 8.5 8.5 8.5 8.5" stroke="#FF0420" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-red-100 dark:ring-red-900/50">
                    {streak}
                </span>
            )}
        </>
    );

    const handleClick = isConnected ? checkInWithContract : connectWallet;
    const isLoading = isInteracting || isConnecting;
    
    let title = isConnected 
        ? `Daily Streak (Optimism): ${streak}. Click to check in.` 
        : "Connect Optimism wallet for daily streak";
    if (isConnecting) title = "Connecting to Optimism...";
    if (isInteracting) title = "Submitting check-in on Optimism...";
    if (error) title = `Optimism Streak Error: ${error}`;

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
