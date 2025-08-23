import { useState, useEffect, useCallback } from 'react';
import { PortfolioSnapshot } from '../types';

const STORAGE_KEY = 'cryptoPortfolioHistory_v1';

const getInitialHistory = (): PortfolioSnapshot[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && (parsed.length === 0 || parsed.every(s => 'date' in s && 'totalValue' in s))) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load portfolio history from localStorage", error);
  }
  return [];
};

export function usePortfolioHistory() {
  const [history, setHistory] = useState<PortfolioSnapshot[]>(getInitialHistory);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save portfolio history to localStorage", error);
    }
  }, [history]);

  const addSnapshot = useCallback((value: number) => {
    if (value <= 0) return; // Don't save zero/negative value snapshots

    const todayStr = new Date().toISOString().split('T')[0];
    
    setHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const lastSnapshot = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;

        if (lastSnapshot && lastSnapshot.date === todayStr) {
            // Update today's snapshot with the latest value
            lastSnapshot.totalValue = value;
        } else {
            // Add a new snapshot for today
            newHistory.push({ date: todayStr, totalValue: value });
        }
        return newHistory;
    });
  }, []);

  return { history, addSnapshot };
}
