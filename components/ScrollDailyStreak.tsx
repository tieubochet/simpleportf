
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
                <path d="M7 2.5C5.58172 2.5 4.5 3.58172 4.5 5V5.5C4.5 6.88071 5.58172 8 7 8H8.5V18H18.5V16.5L20 15L18.5 13.5V5C18.5 3.61929 17.3807 2.5 16 2.5H7Z" fill="#FDF2E2"/>
                <path d="M4.5 5V5.5C4.5 6.88071 5.58172 8 7 8" fill="#E8D8BE"/>
                <path d="M8.5 18H15C16.3807 18 17.5 19.1193 17.5 20.5V20.5C17.5 21.8807 16.3807 23 15 23H10C8.61929 23 7.5 21.8807 7.5 20.5V18H8.5Z" fill="#E8D8BE"/>
                <path d="M7 2.5C5.58172 2.5 4.5 3.58172 4.5 5V5.5C4.5 6.88071 5.58172 8 7 8H8.5V18H18.5V16.5L20 15L18.5 13.5V5C18.5 3.61929 17.3807 2.5 16 2.5H7Z" stroke="#3D2B24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.5 18H15C16.3807 18 17.5 19.1193 17.5 20.5V20.5C17.5 21.8807 16.3807 23 15 23H10C8.61929 23 7.5 21.8807 7.5 20.5V18" stroke="#3D2B24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 7H16" stroke="#3D2B24" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M9 10H16" stroke="#3D2B24" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M9 13H16" stroke="#3D2B24" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="6.5" cy="6" r="0.75" fill="#3D2B24"/>
                <circle cx="15.5" cy="20.5" r="0.75" fill="#3D2B24"/>
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
