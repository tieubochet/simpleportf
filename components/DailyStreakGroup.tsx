import React from 'react';
import { DailyStreak } from './DailyStreak';
import { CeloDailyStreak } from './CeloDailyStreak';
import { UnichainDailyStreak } from './UnichainDailyStreak';
import { EthereumDailyStreak } from './EthereumDailyStreak';
import { OpDailyStreak } from './OpDailyStreak';

export const DailyStreakGroup: React.FC = () => {
    return (
        <div className="flex items-center space-x-2">
            <DailyStreak />
            <CeloDailyStreak />
            
        </div>
    );
};