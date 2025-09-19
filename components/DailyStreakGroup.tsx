import React from 'react';
import { DailyStreak } from './DailyStreak';
import { CeloDailyStreak } from './CeloDailyStreak';
import { UnichainDailyStreak } from './UnichainDailyStreak';
import { EthereumDailyStreak } from './EthereumDailyStreak';

export const DailyStreakGroup: React.FC = () => {
    // This component renders a horizontal group for daily streak check-ins,
    // visually grouping the different blockchain streak buttons under a common label.
    // It's designed to match the height of other buttons in the PortfolioHeader.
    return (
        <div className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 rounded-lg h-10">
             <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 pl-3 pr-1 select-none">Daily Streak</span>
             <div className="flex items-center space-x-1 pr-1">
                <DailyStreak displayMode="icon" />
                <CeloDailyStreak displayMode="icon" />
                <UnichainDailyStreak displayMode="icon" />
                <EthereumDailyStreak displayMode="icon" />
             </div>
        </div>
    );
};
