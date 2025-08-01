
import React from 'react';
import { PerformerData } from '../types';
import { TrophyIcon, TrendingDownIcon } from './icons';

interface PortfolioSummaryProps {
  totalValue: number;
  changeData: {
    changeValue: number;
    changePercentage: number;
  };
  plData: {
    plValue: number;
    plPercentage: number;
  };
  performer: PerformerData | null;
  loser: PerformerData | null;
  isLoading: boolean;
  isPrivacyMode: boolean;
}

const ChangeDisplay: React.FC<{ value: number; percentage: number; isPrivacyMode: boolean; }> = ({ value, percentage, isPrivacyMode }) => {
    const isPositive = value >= 0;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    const sign = isPositive ? '+' : '';

    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        signDisplay: 'exceptZero'
    }).format(value);

    const formattedPercentage = `(${sign}${Math.abs(percentage || 0).toFixed(2)}%)`;
    
    if (isNaN(value) || isNaN(percentage)) {
        return (
            <div>
               <p className="text-base font-semibold text-slate-300">-</p>
               <p className="text-sm font-mono text-slate-400">(-)</p>
            </div>
        );
    }

    return (
        <div className={colorClass}>
            <p className="text-base font-semibold">{isPrivacyMode ? '$ ****' : formattedValue}</p>
            <p className="text-sm font-mono">{formattedPercentage}</p>
        </div>
    );
};

const LoadingSkeletonBlock = () => (
    <>
        <div className="h-5 bg-slate-700 rounded-md animate-pulse w-20"></div>
        <div className="h-4 bg-slate-700 rounded-md animate-pulse w-16 mt-2"></div>
    </>
);

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ totalValue, changeData, plData, performer, loser, isLoading, isPrivacyMode }) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalValue);

  const showLoadingSkeleton = isLoading && totalValue === 0;

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-700">
        
        {/* Stat Block 1: Total Value */}
        <div className="p-4 text-center md:text-left">
          <h2 className="text-sm font-medium text-slate-400 mb-2">Total Portfolio Value</h2>
          {showLoadingSkeleton ? (
            <div className="h-8 bg-slate-700 rounded-md animate-pulse w-32 mx-auto md:mx-0"></div>
          ) : (
            <p className="text-2xl font-bold text-white tracking-tight">{isPrivacyMode ? '$ ****' : formattedValue}</p>
          )}
        </div>
        
        {/* Stat Block 2: 24h Change */}
        <div className="p-4 text-center md:text-left">
          <h2 className="text-sm font-medium text-slate-400 mb-2">24h Change</h2>
           {showLoadingSkeleton ? <LoadingSkeletonBlock /> : <ChangeDisplay value={changeData.changeValue} percentage={changeData.changePercentage} isPrivacyMode={isPrivacyMode} />}
        </div>

        {/* Stat Block 3: Total P/L */}
        <div className="p-4 text-center md:text-left">
          <h2 className="text-sm font-medium text-slate-400 mb-2">Total P/L</h2>
           {showLoadingSkeleton ? <LoadingSkeletonBlock /> : <ChangeDisplay value={plData.plValue} percentage={plData.plPercentage} isPrivacyMode={isPrivacyMode} />}
        </div>
        
        {/* Stat Block 4: Top Gainer */}
        <div className="p-4 text-center md:text-left">
          <h2 className="text-sm font-medium text-slate-400 mb-2 flex items-center space-x-2 justify-center md:justify-start">
            <TrophyIcon className="h-4 w-4 text-amber-400" />
            <span>Top Gainer (24h)</span>
          </h2>
          {showLoadingSkeleton ? (
            <LoadingSkeletonBlock />
          ) : performer ? (
            <div>
              <p className="text-base font-semibold text-white truncate" title={performer.name}>{performer.name}</p>
              <p className={`text-sm font-mono ${performer.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {performer.change >= 0 ? '+' : ''}{performer.change.toFixed(2)}%
              </p>
            </div>
          ) : (
            <p className="text-base font-semibold text-slate-300">-</p>
          )}
        </div>

        {/* Stat Block 5: Top Loser */}
        <div className="p-4 text-center md:text-left">
          <h2 className="text-sm font-medium text-slate-400 mb-2 flex items-center space-x-2 justify-center md:justify-start">
            <TrendingDownIcon className="h-4 w-4 text-red-400" />
            <span>Top Loser (24h)</span>
          </h2>
          {showLoadingSkeleton ? (
            <LoadingSkeletonBlock />
          ) : loser ? (
            <div>
              <p className="text-base font-semibold text-white truncate" title={loser.name}>{loser.name}</p>
              <p className="text-sm font-mono text-red-500">
                {loser.change.toFixed(2)}%
              </p>
            </div>
          ) : (
            <p className="text-base font-semibold text-slate-300">-</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
