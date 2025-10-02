import React from 'react';
import { DailyStreak } from './DailyStreak';
import { CeloDailyStreak } from './CeloDailyStreak';
import { UnichainDailyStreak } from './UnichainDailyStreak';
import { EthereumDailyStreak } from './EthereumDailyStreak';
import { OpDailyStreak } from './OpDailyStreak';
import { MonadDailyStreak } from './MonadDailyStreak';
import { ScrollDailyStreak } from './ScrollDailyStreak';
import { HyperEvmDailyStreak } from './HyperEvmDailyStreak';

export const DailyStreakGroup: React.FC = () => {
    return (
        <div className="flex items-center space-x-2">
            <DailyStreak />
            <CeloDailyStreak />
            <UnichainDailyStreak />
            <EthereumDailyStreak />
            <OpDailyStreak />
            <MonadDailyStreak />
            <ScrollDailyStreak />
            <HyperEvmDailyStreak />
        </div>
    );
};
