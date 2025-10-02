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
    
    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-orange-100 dark:bg-orange-900/50 hover:bg-orange-200 dark:hover:bg-orange-800/60";
    
    const buttonContent = (
        <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#E46124"/>
                <path d="M12 14c-2.21 0-4-1.79-4-4s1.79-4 4-4v1.17c-1.55.5-2.83 1.78-3.33 3.33H12v-1c0-.55-.45-1-1-1s-1 .45-1 1v1c0 1.65 1.35 3 3 3h1c.55 0 1 .45 1-1s-.45-1-1-1h-1v-1.17c1.55-.5 2.83-1.78 3.33-3.33H12v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-1.65-1.35-3-3-3H11c-.55 0-1-.45-1-1s.45-1 1-1h1v-2c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h-2c0 2.21-1.79 4-4 4z" fill="#F8B83A"/>
            </svg>
            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-orange-100 dark:ring-orange-900/50">
                    {streak}
                </span>
            )}
        </>
    );

    const handleClick = isConnected ? checkInWithContract : connectWallet;
    const isLoading = isInteracting || isConnecting;
    
    let title = isConnected 
        ? `Daily Streak (Scroll): ${streak}. Click to check in.` 
        : "Connect Scroll wallet for daily streak";
    if (isConnecting) title = "Connecting to Scroll...";
    if (isInteracting) title = "Submitting check-in on Scroll...";
    if (error) title = `Scroll Streak Error: ${error}`;

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