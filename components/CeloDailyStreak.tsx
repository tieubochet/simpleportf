import React from 'react';
import { useCeloStreak } from '../hooks/useCeloStreak';

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

    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-800/60";

    const buttonContent = (
        <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#FDE047"/>
                <path d="M6 6H18V18H6V6Z" fill="black"/>
                <circle cx="13.5" cy="12" r="5" fill="#FDE047"/>
            </svg>
            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-yellow-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-yellow-100 dark:ring-yellow-900/50">
                    {streak}
                </span>
            )}
        </>
    );

    const handleClick = isConnected ? checkInWithContract : connectWallet;
    const isLoading = isInteracting || isConnecting;

    let title = isConnected 
        ? `Daily Streak (Celo): ${streak}. Click to check in.` 
        : "Connect wallet for Celo daily streak";
    if (isConnecting) title = "Switching to Celo network...";
    if (isInteracting) title = "Submitting check-in on Celo...";
    if (error) title = `Celo Streak Error: ${error}`;

    return (
        <button onClick={handleClick} disabled={isLoading} className={iconButtonStyles} title={title} aria-label={title}>
            {buttonContent}
        </button>
    );
};