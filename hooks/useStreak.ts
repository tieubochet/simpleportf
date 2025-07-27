import { useState, useEffect, useCallback } from 'react';

const STREAK_KEY = 'cryptoPortfolioStreak_v1';

interface StreakData {
  count: number;
  lastVisit: string; // YYYY-MM-DD
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

export function useStreak() {
  const [streakCount, setStreakCount] = useState<number>(0);

  const updateStreak = useCallback(() => {
    try {
      const stored = localStorage.getItem(STREAK_KEY);
      const today = getTodayDateString();
      let data: StreakData = { count: 0, lastVisit: '' };

      if (stored) {
        data = JSON.parse(stored);
      }
      
      if (data.lastVisit === today && data.count > 0) {
        // Already visited today, do nothing.
        setStreakCount(data.count);
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      let newCount = 0;
      if (data.lastVisit === yesterdayString) {
        // It's a consecutive day
        newCount = data.count + 1;
      } else {
        // Streak is broken or it's the first visit
        newCount = 1;
      }

      const newData: StreakData = {
        count: newCount,
        lastVisit: today,
      };

      localStorage.setItem(STREAK_KEY, JSON.stringify(newData));
      setStreakCount(newCount);

    } catch (error) {
      console.error("Failed to update streak data:", error);
      // Fail gracefully if localStorage is not available or parsing fails
      setStreakCount(0);
    }
  }, []);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]); // Run only on initial mount

  return streakCount;
}
