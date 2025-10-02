import React from 'react';
// FIX: Removed the import for the non-existent 'DailyStreak' component.
import { CeloDailyStreak } from './CeloDailyStreak';
import { UnichainDailyStreak } from './UnichainDailyStreak';
import { EthereumDailyStreak } from './EthereumDailyStreak';
import { OpDailyStreak } from './OpDailyStreak';
import { MonadDailyStreak } from './MonadDailyStreak';
import { ScrollDailyStreak } from './ScrollDailyStreak';

export const DailyStreakGroup: React.FC = () => {
    return (
        <div className="flex items-center space-x-2">
            {/* FIX: Removed the non-existent 'DailyStreak' component from being rendered. */}
            <CeloDailyStreak />
            <UnichainDailyStreak />
            <EthereumDailyStreak />
            <OpDailyStreak />
            <MonadDailyStreak />
            <ScrollDailyStreak />
        </div>
    );
};