import React from 'react';
import { useUnichainStreak } from '../hooks/useUnichainStreak';
import { WalletIcon } from './icons';

interface UnichainDailyStreakProps {
    displayMode?: 'full' | 'icon';
}

export const UnichainDailyStreak: React.FC<UnichainDailyStreakProps> = ({ displayMode = 'full' }) => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useUnichainStreak();

    const fullButtonStyles = "flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed";
    const iconButtonStyles = "flex items-center justify-center p-1 h-8 w-8 rounded-md transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed text-slate-800 dark:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-600/50";
    
    if (displayMode === 'icon') {
        const buttonContent = (
            <>
                <svg className={`h-5 w-5 ${!isConnected ? 'opacity-50' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#8B5CF6" />
                    <path d="M8 8V13C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13V8" stroke="white" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isConnected && streak > 0 && (
                     <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-slate-200 dark:ring-slate-700">
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
    }

    if (!isConnected) {
        return (
            <div className="relative">
                <button onClick={connectWallet} disabled={isConnecting} className={`${fullButtonStyles} bg-purple-500 hover:bg-purple-600 text-white`} title="Connect Unichain wallet to say GM">
                    <WalletIcon className="h-5 w-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Unichain Streak'}</span>
                </button>
                 {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const isLoading = isInteracting || isConnecting;
    let title = "Say GM on Unichain for today's streak";
    if (isLoading) title = "Processing transaction...";

    return (
        <div className="relative">
            <button onClick={checkInWithContract} className={`${fullButtonStyles} bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white`} title={title} disabled={isLoading}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#8B5CF6" strokeWidth="2" strokeMiterlimit="10"/>
                    <path d="M8 8V13C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13V8" stroke="#8B5CF6" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-bold">{streak}</span>
            </button>
            {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
        </div>
    );
};
