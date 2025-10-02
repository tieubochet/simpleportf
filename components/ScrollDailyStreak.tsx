import React from 'react';
import { useScrollStreak } from '../hooks/useScrollStreak';

export const ScrollDailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useScrollStreak();

    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/60";

    const buttonContent = (
        <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#FBBF24"/>
                <path d="M8.5 7.5L15.5 7.5M8.5 10.5L15.5 10.5M8.5 13.5L12.5 13.5M8.5 16.5L12.5 16.5" stroke="#422006" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>

            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-amber-100 dark:ring-amber-900/50">
                    {streak}
                </span>
            )}
        </>
    );

    const handleClick = isConnected ? checkInWithContract : connectWallet;
    const isLoading = isInteracting || isConnecting;

    let title = isConnected 
        ? `Daily Streak (Scroll): ${streak}. Click to check in.` 
        : "Connect wallet for Scroll daily streak";
    if (isConnecting) title = "Switching to Scroll network...";
    if (isInteracting) title = "Submitting check-in on Scroll...";
    if (error) title = `Scroll Streak Error: ${error}`;

    return (
        <button onClick={handleClick} disabled={isLoading} className={iconButtonStyles} title={title} aria-label={title}>
            {buttonContent}
        </button>
    );
};