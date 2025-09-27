import React from 'react';
import { useMonadStreak } from '../hooks/useMonadStreak';

export const MonadDailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useMonadStreak();
    
    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-800/60";
    
    const buttonContent = (
        <>
            <svg className="h-5 w-5 rounded" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="5" fill="#3A1F4D"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm2 4h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" fill="white"/>
            </svg>
            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-purple-100 dark:ring-purple-900/50">
                    {streak}
                </span>
            )}
        </>
    );

    const handleClick = isConnected ? checkInWithContract : connectWallet;
    const isLoading = isInteracting || isConnecting;
    
    let title = isConnected 
        ? `Daily Streak (Monad): ${streak}. Click to check in.` 
        : "Connect wallet for Monad daily streak";
    if (isConnecting) title = "Switching to Monad network...";
    if (isInteracting) title = "Submitting check-in on Monad...";
    if (error) title = `Monad Streak Error: ${error}`;

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