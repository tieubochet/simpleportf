import React from 'react';
import { useEthereumStreak } from '../hooks/useEthereumStreak';
import { WalletIcon } from './icons';

interface EthereumDailyStreakProps {
    displayMode?: 'full' | 'icon';
}

export const EthereumDailyStreak: React.FC<EthereumDailyStreakProps> = ({ displayMode = 'full' }) => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useEthereumStreak();
    
    const fullButtonStyles = "flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed";
    const iconButtonStyles = "flex items-center justify-center p-1 h-8 w-8 rounded-md transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed text-slate-800 dark:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-600/50";

    if (displayMode === 'icon') {
        const buttonContent = (
            <>
                <svg className={`h-5 w-5 ${!isConnected ? 'opacity-50' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L11.5 3.5L7.5 12L12 15L16.5 12L12.5 3.5L12 2Z" className="fill-[#343434] dark:fill-slate-300"/>
                    <path d="M12 16L7.5 13L12 22L16.5 13L12 16Z" className="fill-[#8C8C8C] dark:fill-slate-500"/>
                    <path d="M12 15L16.5 12L12 2V15Z" className="fill-[#3C3C3B] dark:fill-slate-400"/>
                    <path d="M12 15L7.5 12L12 2V15Z" className="fill-[#8C8C8C] dark:fill-slate-500"/>
                    <path d="M7.5 13L12 16V22L7.5 13Z" className="fill-[#141414] dark:fill-slate-200"/>
                    <path d="M16.5 13L12 16V22L16.5 13Z" className="fill-[#393939] dark:fill-slate-400"/>
                </svg>
                {isConnected && streak > 0 && (
                     <span className="absolute -top-0.5 -right-0.5 bg-slate-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-slate-100 dark:ring-slate-900">
                        {streak}
                    </span>
                )}
            </>
        );

        const handleClick = isConnected ? checkInWithContract : connectWallet;
        const isLoading = isInteracting || isConnecting;

        let title = isConnected 
            ? `Daily Streak (Ethereum): ${streak}. Click to check in.` 
            : "Connect Ethereum wallet for daily streak";
        if (isConnecting) title = "Connecting to Ethereum...";
        if (isInteracting) title = "Submitting check-in on Ethereum...";
        if (error) title = `Ethereum Streak Error: ${error}`;

        return (
            <button onClick={handleClick} disabled={isLoading} className={iconButtonStyles} title={title} aria-label={title}>
                {buttonContent}
            </button>
        );
    }
    
    if (!isConnected) {
        return (
            <div className="relative">
                <button onClick={connectWallet} disabled={isConnecting} className={`${fullButtonStyles} bg-slate-600 hover:bg-slate-700 text-white`} title="Connect Ethereum wallet to say GM">
                    <WalletIcon className="h-5 w-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Ethereum Streak'}</span>
                </button>
                 {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const isLoading = isInteracting || isConnecting;
    let title = "Say GM on Ethereum for today's streak";
    if (isLoading) title = "Processing transaction...";

    return (
        <div className="relative">
            <button onClick={checkInWithContract} className={`${fullButtonStyles} bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white`} title={title} disabled={isLoading}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L11.5 3.5L7.5 12L12 15L16.5 12L12.5 3.5L12 2Z" className="fill-[#343434] dark:fill-slate-300"/>
                    <path d="M12 16L7.5 13L12 22L16.5 13L12 16Z" className="fill-[#8C8C8C] dark:fill-slate-500"/>
                    <path d="M12 15L16.5 12L12 2V15Z" className="fill-[#3C3C3B] dark:fill-slate-400"/>
                    <path d="M12 15L7.5 12L12 2V15Z" className="fill-[#8C8C8C] dark:fill-slate-500"/>
                    <path d="M7.5 13L12 16V22L7.5 13Z" className="fill-[#141414] dark:fill-slate-200"/>
                    <path d="M16.5 13L12 16V22L16.5 13Z" className="fill-[#393939] dark:fill-slate-400"/>
                </svg>
                <span className="font-bold">{streak}</span>
            </button>
            {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
        </div>
    );
};