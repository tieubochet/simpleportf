
import React from 'react';
import { useStreak } from '../hooks/useStreak';
import { FireIcon } from './icons';

export const DailyStreak: React.FC = () => {
    const { streakCount, canConfirmToday, confirmDailyVisit } = useStreak();

    const handleClick = () => {
        if (canConfirmToday) {
            confirmDailyVisit();
        } else {
            alert(`You've already confirmed your visit for today! Your current streak is ${streakCount}.`);
        }
    };
    
    // Add glowing animation if confirmation is needed.
    const pulseAnimation = canConfirmToday ? 'animate-pulse' : '';
    const cursorClass = canConfirmToday ? 'cursor-pointer' : 'cursor-default';
    const buttonColors = "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600";

    return (
        <button 
            onClick={handleClick} 
            className={`flex items-center space-x-2 text-amber-500 dark:text-amber-400 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 relative ${buttonColors} ${pulseAnimation} ${cursorClass}`}
            title={canConfirmToday ? "Click to confirm your daily visit!" : `Current streak: ${streakCount} days`}
            disabled={!canConfirmToday}
        >
            <FireIcon className="h-5 w-5" />
            <span>{streakCount}</span>
        </button>
    );
};