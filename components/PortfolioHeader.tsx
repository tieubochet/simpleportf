
import React from 'react';
import { UploadIcon, DownloadIcon, WalletIcon, EyeIcon, EyeOffIcon } from './icons';
import { DailyStreak } from './DailyStreak';

interface PortfolioHeaderProps {
  onAddWallet: () => void;
  onImport: () => void;
  onExport: () => void;
  isPrivacyMode: boolean;
  onTogglePrivacyMode: () => void;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ onAddWallet, onImport, onExport, isPrivacyMode, onTogglePrivacyMode }) => {

  return (
    <header className="flex flex-col md:flex-row items-center justify-between mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-0">
        Crypto Portfolios
      </h1>
      <div className="flex items-center space-x-2">
        <button 
          onClick={onTogglePrivacyMode} 
          className="flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white font-semibold p-2 rounded-lg transition-colors duration-300 h-10 w-10" 
          title={isPrivacyMode ? "Show values" : "Hide values (Privacy Mode)"}
        >
          {isPrivacyMode ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
        <button onClick={onImport} className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
          <UploadIcon className="h-5 w-5" />
          <span>Import</span>
        </button>
        <button onClick={onExport} className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
          <DownloadIcon className="h-5 w-5" />
          <span>Export</span>
        </button>
        <button onClick={onAddWallet} className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
          <WalletIcon className="h-5 w-5" />
          <span>Add Wallet</span>
        </button>
        <DailyStreak />
      </div>
    </header>
  );
};

export default PortfolioHeader;
