
import React from 'react';
import { useWeb3Streak } from '../hooks/useWeb3Streak';
import { BoltIcon, WalletIcon } from './icons';

export const DailyStreak: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        isInteracting,
        canInteract,
        error,
        connectWallet,
        interactWithContract,
    } = useWeb3Streak();

    const isLoading = isConnecting || isInteracting;
    const commonButtonStyles = "flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 relative disabled:opacity-70 disabled:cursor-not-allowed";

    const handleClick = () => {
        if (!isConnected) {
            connectWallet();
        } else if (canInteract) {
            interactWithContract();
        }
    };
    
    if (!isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={handleClick}
                    disabled={isLoading}
                    className={`${commonButtonStyles} bg-cyan-500 hover:bg-cyan-600 text-white`}
                    title="Connect wallet to interact with the contract"
                >
                    <WalletIcon className="h-5 w-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
                 {error && <p className="absolute top-full mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const isButtonDisabled = isLoading || !canInteract;
    const buttonText = isInteracting ? 'Interacting...' : canInteract ? 'Interact' : 'Not Ready';
    
    const buttonColors = isButtonDisabled && !isInteracting
        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
        : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white";
        
    const title = isInteracting 
        ? "Processing..." 
        : canInteract 
            ? "Interact with the smart contract" 
            : "Contract is not ready (cooldown)";

    return (
        <div className="relative">
            <button 
                onClick={handleClick} 
                className={`${commonButtonStyles} ${buttonColors}`}
                title={title}
                disabled={isButtonDisabled}
            >
                <BoltIcon className="h-5 w-5" />
                <span>{buttonText}</span>
            </button>
            {error && <p className="absolute top-full right-0 mt-1 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">{error}</p>}
        </div>
    );
};
