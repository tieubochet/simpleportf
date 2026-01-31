// components/PortfolioHeader.tsx
import React from 'react';
import { UploadIcon, DownloadIcon, WalletIcon, EyeIcon, EyeOffIcon, SunIcon, MoonIcon, RefreshCwIcon, ContrastIcon } from './icons';
import { DailyStreakGroup } from './DailyStreakGroup';
import type { Theme } from '../hooks/useTheme';
// 1. Import Supabase
import { supabase } from '../services/supabase';

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
  // 2. Thêm prop user
  user: any; 
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ 
  onAddWallet, onImport, onExport, isPrivacyMode, onTogglePrivacyMode, 
  theme, onToggleTheme, onRefresh, isRefreshing, user 
}) => {

  const commonButtonStyles = "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const ThemeIcon = theme === 'light' ? MoonIcon : theme === 'dim' ? ContrastIcon : SunIcon;
  const nextTheme = theme === 'light' ? 'dim' : theme === 'dim' ? 'dark' : 'light';

  // 3. Hàm xử lý đăng nhập/đăng xuất
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 md:mb-0">
        Crypto Portfolios
      </h1>
      <div className="flex items-center space-x-2 flex-wrap justify-center gap-y-2">
        {/* Nút Login/Logout mới */}
        {user ? (
          <div className="flex items-center mr-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800">
            <span className="text-xs mr-2 text-green-800 dark:text-green-300 hidden sm:inline">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center justify-center h-10 px-4 mr-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors duration-300"
          >
            <span>Login / Sync</span>
          </button>
        )}

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
        <DailyStreakGroup />
      </div>
    </header>
  );
};

export default PortfolioHeader;