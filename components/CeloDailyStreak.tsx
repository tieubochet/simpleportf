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

    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-800/60";

    const buttonContent = (
        <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.419 12.428c0 5.24-4.26 9.5-9.5 9.5-5.24 0-9.5-4.26-9.5-9.5 0-5.24 4.26-9.5 9.5-9.5 5.24 0 9.5 4.26 9.5 9.5z" fill="#35D07F" stroke="#35D07F" strokeWidth="2.5" strokeMiterlimit="10"></path>
                <path d="M17.419 12.428a5.5 5.5 0 01-11 0 5.5 5.5 0 0111 0z" stroke="#FCFF52" strokeWidth="2" strokeMiterlimit="10"></path>
            </svg>
            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-emerald-100 dark:ring-emerald-900/50">
                    {streak}
                </span>
            )}
        </>
    );

    const handleClick = isConnected ? checkInWithContract : connectWallet;
    const isLoading = isInteracting || isConnecting;

    let title = isConnected 
        ? `Daily Streak (Celo): ${streak}. Click to check in.` 
        : "Connect Celo wallet for daily streak";
    if (isConnecting) title = "Connecting to Celo...";
    if (isInteracting) title = "Submitting check-in on Celo...";
    if (error) title = `Celo Streak Error: ${error}`;

    return (
        <button onClick={handleClick} disabled={isLoading} className={iconButtonStyles} title={title} aria-label={title}>
            {buttonContent}
        </button>
    );
};