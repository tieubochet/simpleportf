import React from 'react';
import { GlobalData } from '../types';

const formatLargeNumber = (num: number): string => {
  if (!num || num === 0) return '$0.00';
  if (num >= 1_000_000_000_000) {
    return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface GlobalStatsBarProps {
    globalData: GlobalData | null;
}

const GlobalStatsBar: React.FC<GlobalStatsBarProps> = ({ globalData }) => {
    const changePercentage = globalData?.market_cap_change_percentage_24h_usd;
    const isPositive = typeof changePercentage === 'number' && changePercentage >= 0;
    const colorClass = isPositive ? 'text-green-400' : 'text-red-400';

    return (
        <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center h-10 space-x-6 text-xs text-slate-400 overflow-x-auto">
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <span>Market Cap:</span>
                        {globalData ? (
                            <>
                                <span className="font-mono text-slate-200 font-medium">{formatLargeNumber(globalData.total_market_cap_usd)}</span>
                                {typeof changePercentage === 'number' && (
                                     <span className={`${colorClass} font-mono font-medium`}>
                                        {changePercentage.toFixed(2)}%
                                     </span>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="h-4 w-24 bg-slate-700 rounded-md animate-pulse"></div>
                                <div className="h-4 w-12 bg-slate-700 rounded-md animate-pulse"></div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalStatsBar;