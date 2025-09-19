import React from 'react';
import { useUnichainStreak } from '../hooks/useUnichainStreak';

export const UnichainDailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useUnichainStreak();

    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-800/60";
    
    const buttonContent = (
        <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#8B5CF6" />
                <path d="M8 8V13C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13V8" stroke="white" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
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
        ? `Daily Streak (Unichain): ${streak}. Click to check in.` 
        : "Connect Unichain wallet for daily streak";
    if (isConnecting) title = "Connecting to Unichain...";
    if (isInteracting) title = "Submitting check-in on Unichain...";
    if (error) title = `Unichain Streak Error: ${error}`;

    return (
        <button onClick={handleClick} disabled={isLoading} className={iconButtonStyles} title={title} aria-label={title}>
            {buttonContent}
        </button>
    );
};