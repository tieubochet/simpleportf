import React from 'react';
import { useEthereumStreak } from '../hooks/useEthereumStreak';
import { WalletIcon } from './icons';

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

    const commonButtonStyles = "flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed";

    if (!isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className={`${commonButtonStyles} bg-slate-600 hover:bg-slate-700 text-white`}
                    title="Connect Ethereum wallet to say GM"
                >
                    <WalletIcon className="h-5 w-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Ethereum Streak'}</span>
                </button>
                 {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const isLoading = isInteracting || isConnecting;
    
    let title = "Say GM on Ethereum for today's streak";

    if (isLoading) {
        title = "Processing transaction...";
    }

    return (
        <div className="relative">
            <button 
                onClick={checkInWithContract} 
                className={`${commonButtonStyles} bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white`}
                title={title}
                disabled={isLoading}
            >
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
