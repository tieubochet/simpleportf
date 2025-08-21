
import React from 'react';
import { UploadIcon, DownloadIcon, WalletIcon, EyeIcon, EyeOffIcon, SunIcon, MoonIcon, RefreshCwIcon, ContrastIcon } from './icons';
import { DailyStreak } from './DailyStreak';
import type { Theme } from '../hooks/useTheme';

interface PortfolioHeaderProps {
  onAddWallet: () => void;
  onImport: () => void;
  onExport: () => void;
  isPrivacyMode: boolean;
  onTogglePrivacyMode: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ onAddWallet, onImport, onExport, isPrivacyMode, onTogglePrivacyMode, theme, onToggleTheme, onRefresh, isRefreshing }) => {

  const commonButtonStyles = "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const ThemeIcon = theme === 'light' ? MoonIcon : theme === 'dim' ? ContrastIcon : SunIcon;
  const nextTheme = theme === 'light' ? 'dim' : theme === 'dim' ? 'dark' : 'light';

  return (
    <header className="flex flex-col md:flex-row items-center justify-between mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 md:mb-0">
        Crypto Portfolios
      </h1>
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleTheme}
          className={`flex items-center justify-center p-2 h-10 w-10 ${commonButtonStyles}`}
          title={`Switch to ${nextTheme} mode`}
        >
          <ThemeIcon className="h-5 w-5" />
        </button>
        <button 
          onClick={onTogglePrivacyMode} 
          className={`flex items-center justify-center p-2 h-10 w-10 ${commonButtonStyles}`} 
          title={isPrivacyMode ? "Show values" : "Hide values (Privacy Mode)"}
        >
          {isPrivacyMode ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
         <button 
          onClick={onRefresh} 
          disabled={isRefreshing}
          className={`flex items-center justify-center p-2 h-10 w-10 ${commonButtonStyles}`} 
          title="Refresh prices"
        >
          <RefreshCwIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={onImport} className={`flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 sm:space-x-2 ${commonButtonStyles}`}>
          <UploadIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Import</span>
        </button>
        <button onClick={onExport} className={`flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 sm:space-x-2 ${commonButtonStyles}`}>
          <DownloadIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button onClick={onAddWallet} className="flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 sm:space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors duration-300">
          <WalletIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Add Wallet</span>
        </button>
        <DailyStreak />
      </div>
    </header>
  );
};

export default PortfolioHeader;