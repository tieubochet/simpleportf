
import { useState, useEffect, useCallback } from 'react';

const STREAK_KEY = 'cryptoPortfolioStreak_v1';

interface StreakData {
  count: number;
  lastVisit: string; // ISO date string (YYYY-MM-DD)
}

const getInitialStreak = (): StreakData => {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (typeof data.count === 'number' && typeof data.lastVisit === 'string') {
        return data;
      }
    }
  } catch (error) {
    console.error("Failed to load streak data from localStorage", error);
  }
  return { count: 0, lastVisit: '' };
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(getInitialStreak);
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    const today = new Date();
    const lastVisitDate = streak.lastVisit ? new Date(streak.lastVisit) : null;
    
    // You can confirm if you haven't visited today.
    if (!lastVisitDate || !isSameDay(today, lastVisitDate)) {
      setCanConfirm(true);
    } else {
      setCanConfirm(false);
    }
  }, [streak.lastVisit]);

  const confirmDailyVisit = useCallback(() => {
    if (!window.confirm("Confirm your daily visit to continue your streak?")) {
        return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const lastVisitDate = streak.lastVisit ? new Date(streak.lastVisit) : null;
    
    let newCount = streak.count;

    if (lastVisitDate) {
        // Continue streak if last visit was yesterday
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (isSameDay(lastVisitDate, yesterday)) {
            newCount += 1;
        } 
        // Reset streak if last visit was before yesterday or today (which is impossible due to canConfirm logic but safe to have)
        else if (!isSameDay(lastVisitDate, today)) {
            newCount = 1;
        }
    } else {
        // First ever visit
        newCount = 1;
    }

    const newStreakData = { count: newCount, lastVisit: todayStr };
    localStorage.setItem(STREAK_KEY, JSON.stringify(newStreakData));
    setStreak(newStreakData);
    alert(`Your streak is now ${newCount}! Come back tomorrow to continue.`);
  }, [streak]);

  return { 
    streakCount: streak.count, 
    canConfirmToday: canConfirm, 
    confirmDailyVisit 
  };
}
