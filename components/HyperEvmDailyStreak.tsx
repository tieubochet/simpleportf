
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
    
    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-cyan-100 dark:bg-cyan-900/50 hover:bg-cyan-200 dark:hover:bg-cyan-800/60";
    
    const buttonContent = (
        <>
            <svg className="h-6 w-6" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path d="M56.5 146.4C27.9 140.5 12.3 111.4 22.1 83.4 31.9 55.4 64.9 44.1 92.9 53.9c12 4.3 20.9 13.2 25.9 24C135.2 71.3 154.5 73.8 168.4 85.3c21.2 16.2 24.9 45-9.8 65-14.7 20-42.8 25.5-62.8 10.8-6.5-5-11.5-12-14.4-19.7-10.8 12.4-26.3 13.9-45.1 8.1Z" fill="#91F9E6"/>
            </svg>
            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-cyan-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-cyan-100 dark:ring-cyan-900/50">
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
