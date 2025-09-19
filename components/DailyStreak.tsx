import React from 'react';
import { useWeb3Streak } from '../hooks/useWeb3Streak';

export const DailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useWeb3Streak();
    
    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/60";
    
    const buttonContent = (
        <>
            <svg className="h-5 w-5" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 256C57.307 256 0 198.693 0 128S57.307 0 128 0s128 57.307 128 128-57.307 128-128 128Z" fill="#0052FF"></path></svg>
            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-blue-100 dark:ring-blue-900/50">
                    {streak}
                </span>
            )}
        </>
    );

    const handleClick = isConnected ? checkInWithContract : connectWallet;
    const isLoading = isInteracting || isConnecting;
    
    let title = isConnected 
        ? `Daily Streak (Base): ${streak}. Click to check in.` 
        : "Connect Base wallet for daily streak";
    if (isConnecting) title = "Connecting to Base...";
    if (isInteracting) title = "Submitting check-in on Base...";
    if (error) title = `Base Streak Error: ${error}`;

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