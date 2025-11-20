import { useState, useEffect, useCallback } from 'react';
import { type HistoryItem, type AnalysisResult } from '../types';

const HISTORY_KEY = 'Ingrewise_analysis_history_v1';
const MAX_HISTORY_ITEMS = 20;

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  };

  const addHistoryItem = useCallback((result: AnalysisResult) => {
    const newItem: HistoryItem = {
      id: `${Date.now()}`,
      productName: result.productName,
      overallScore: result.overallScore,
      timestamp: Date.now(),
      result,
    };

    setHistory(prevHistory => {
      // Prevent duplicates of the exact same product added seconds apart
      const filteredHistory = prevHistory.filter(item => item.productName !== newItem.productName);
      const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(updatedHistory);
      return updatedHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear history from localStorage", error);
    }
  }, []);

  return { history, addHistoryItem, clearHistory };
};