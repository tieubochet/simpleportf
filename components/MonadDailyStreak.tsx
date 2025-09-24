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
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#845EEE"/>
              <path fillRule="evenodd" d="M17.5 8.5C17.5 7.11929 16.3807 6 15 6H9C7.61929 6 6.5 7.11929 6.5 8.5V15.5C6.5 16.8807 7.61929 18 9 18H15C16.3807 18 17.5 16.8807 17.5 15.5V8.5ZM15.25 9.25C15.25 9.11193 15.1381 9 15 9H9C8.86193 9 8.75 9.11193 8.75 9.25V14.75C8.75 14.8881 8.86193 15 9 15H15C15.1381 15 15.25 14.8881 15.25 14.75V9.25Z" fill="white"/>
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
        : "Connect Monad wallet for daily streak";
    if (isConnecting) title = "Connecting to Monad...";
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
