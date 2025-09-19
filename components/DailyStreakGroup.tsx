import React from 'react';
import { DailyStreak } from './DailyStreak';
import { CeloDailyStreak } from './CeloDailyStreak';
import { UnichainDailyStreak } from './UnichainDailyStreak';
import { EthereumDailyStreak } from './EthereumDailyStreak';

export const DailyStreakGroup: React.FC = () => {
    // This component renders a group of daily streak buttons using a fieldset
    // for a visual style that matches the user's request, resembling a
    // labeled group of inputs.
    return (
        <fieldset className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2">
            <legend className="px-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Daily Streak</legend>
            <div className="flex items-center space-x-2">
                <DailyStreak />
                <CeloDailyStreak />
                <UnichainDailyStreak />
                <EthereumDailyStreak />
            </div>
        </fieldset>
    );
};
