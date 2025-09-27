import React from 'react';
import { useEthereumStreak } from '../hooks/useEthereumStreak';

export const EthereumDailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useEthereumStreak();
    
    const iconButtonStyles = "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600";

    const buttonContent = (
        <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L11.5 3.5L7.5 12L12 15L16.5 12L12.5 3.5L12 2Z" className="fill-[#343434] dark:fill-slate-300"/>
                <path d="M12 16L7.5 13L12 22L16.5 13L12 16Z" className="fill-[#8C8C8C] dark:fill-slate-500"/>
                <path d="M12 15L16.5 12L12 2V15Z" className="fill-[#3C3C3B] dark:fill-slate-400"/>
                <path d="M12 15L7.5 12L12 2V15Z" className="fill-[#8C8C8C] dark:fill-slate-500"/>
                <path d="M7.5 13L12 16V22L7.5 13Z" className="fill-[#141414] dark:fill-slate-200"/>
                <path d="M16.5 13L12 16V22L16.5 13Z" className="fill-[#393939] dark:fill-slate-400"/>
            </svg>
            {isConnected && streak > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-slate-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-slate-200 dark:ring-slate-700">
                    {streak}
                </span>
            )}
        </>
    );

    const handleClick = isConnected ? checkInWithContract : connectWallet;
    const isLoading = isInteracting || isConnecting;

    let title = isConnected 
        ? `Daily Streak (Ethereum): ${streak}. Click to check in.` 
        : "Connect wallet for Ethereum daily streak";
    if (isConnecting) title = "Switching to Ethereum network...";
    if (isInteracting) title = "Submitting check-in on Ethereum...";
    if (error) title = `Ethereum Streak Error: ${error}`;

    return (
        <button onClick={handleClick} disabled={isLoading} className={iconButtonStyles} title={title} aria-label={title}>
            {buttonContent}
        </button>
    );
};