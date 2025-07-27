
import React from 'react';
import { GlobalData } from '../types';
import { FireIcon } from './icons';

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
    streakCount: number;
}

const Stat: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center space-x-2 flex-shrink-0">
        <span className="text-slate-500 dark:text-slate-400">{label}:</span>
        {children}
    </div>
);

const SkeletonStat: React.FC<{ widthClass: string }> = ({ widthClass }) => (
    <div className={`h-4 ${widthClass} bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse`}></div>
);

const GlobalStatsBar: React.FC<GlobalStatsBarProps> = ({ globalData, streakCount }) => {
    const changePercentage = globalData?.market_cap_change_percentage_24h_usd;
    const isPositive = typeof changePercentage === 'number' && changePercentage >= 0;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-10 text-xs font-mono">
                    <div className="flex items-center space-x-4 md:space-x-6 overflow-x-auto whitespace-nowrap">
                        {globalData ? (
                            <>
                                <Stat label="Market Cap">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatLargeNumber(globalData.total_market_cap_usd)}</span>
                                    {typeof changePercentage === 'number' && (
                                        <span className={colorClass}>
                                            {changePercentage.toFixed(2)}%
                                        </span>
                                    )}
                                </Stat>
                                <Stat label="24h Vol">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatLargeNumber(globalData.total_volume_usd)}</span>
                                </Stat>
                                <Stat label="BTC Dom">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{globalData.btc_dominance.toFixed(2)}%</span>
                                </Stat>
                                <Stat label="ETH Dom">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{globalData.eth_dominance.toFixed(2)}%</span>
                                </Stat>
                            </>
                        ) : (
                            // Loading Skeletons matching the stats
                            <>
                            <SkeletonStat widthClass="w-40" />
                            <SkeletonStat widthClass="w-28" />
                            <SkeletonStat widthClass="w-24" />
                            <SkeletonStat widthClass="w-24" />
                            </>
                        )}
                    </div>

                    {streakCount > 0 && (
                        <div className="hidden sm:flex items-center space-x-1 pl-4 flex-shrink-0" title={`${streakCount}-day streak`}>
                            <span className="font-bold text-orange-400">{streakCount}</span>
                            <FireIcon className="h-4 w-4 text-orange-400" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalStatsBar;