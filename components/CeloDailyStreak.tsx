import React from 'react';
import { useCeloStreak } from '../hooks/useCeloStreak';
import { WalletIcon } from './icons';

interface CeloDailyStreakProps {
    displayMode?: 'full' | 'icon';
}

export const CeloDailyStreak: React.FC<CeloDailyStreakProps> = ({ displayMode = 'full' }) => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        streak,
        error,
        connectWallet,
        checkInWithContract,
    } = useCeloStreak();

    const fullButtonStyles = "flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed";
    const iconButtonStyles = "flex items-center justify-center p-1 h-8 w-8 rounded-md transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed text-slate-800 dark:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-600/50";

    if (displayMode === 'icon') {
        const buttonContent = (
            <>
                <svg className={`h-5 w-5 ${!isConnected ? 'opacity-50' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.419 12.428c0 5.24-4.26 9.5-9.5 9.5-5.24 0-9.5-4.26-9.5-9.5 0-5.24 4.26-9.5 9.5-9.5 5.24 0 9.5 4.26 9.5 9.5z" fill="#35D07F" stroke="#35D07F" strokeWidth="2.5" strokeMiterlimit="10"></path>
                    <path d="M17.419 12.428a5.5 5.5 0 01-11 0 5.5 5.5 0 0111 0z" stroke="#FCFF52" strokeWidth="2" strokeMiterlimit="10"></path>
                </svg>
                {isConnected && streak > 0 && (
                     <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ring-2 ring-slate-100 dark:ring-slate-900">
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
    }
    
    if (!isConnected) {
        return (
            <div className="relative">
                <button onClick={connectWallet} disabled={isConnecting} className={`${fullButtonStyles} bg-emerald-500 hover:bg-emerald-600 text-white`} title="Connect Celo wallet to say GM">
                    <WalletIcon className="h-5 w-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Celo Streak'}</span>
                </button>
                 {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const isLoading = isInteracting || isConnecting;
    let title = "Say GM on Celo for today's streak";
    if (isLoading) title = "Processing transaction...";

    return (
        <div className="relative">
            <button onClick={checkInWithContract} className={`${fullButtonStyles} bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white`} title={title} disabled={isLoading}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.419 12.428c0 5.24-4.26 9.5-9.5 9.5-5.24 0-9.5-4.26-9.5-9.5 0-5.24 4.26-9.5 9.5-9.5 5.24 0 9.5 4.26 9.5 9.5z" stroke="#35D07F" strokeWidth="2.5" strokeMiterlimit="10"></path><path d="M17.419 12.428a5.5 5.5 0 01-11 0 5.5 5.5 0 0111 0z" stroke="#35D07F" strokeWidth="2" strokeMiterlimit="10"></path></svg>
                <span className="font-bold">{streak}</span>
            </button>
            {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
        </div>
    );
};