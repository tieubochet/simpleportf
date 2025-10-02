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
            <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 5H9C7.34315 5 6 6.34315 6 8V27C6 28.6569 7.34315 30 9 30H19C22.3137 30 25 27.3137 25 24C25 20.6863 22.3137 18 19 18C17.7404 18 16.597 18.386 15.6829 19" 
                    stroke="#3D2B24" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="#FDF2E2"
                />
                <path d="M25 5C25 2.23858 22.7614 2 20 2C16.5 2 16.5 5 9 5" 
                    stroke="#3D2B24" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <path d="M11 11H21" stroke="#3D2B24" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M11 16H21" stroke="#3D2B24" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M11 21H17" stroke="#3D2B24" strokeWidth="2.5" strokeLinecap="round"/>
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