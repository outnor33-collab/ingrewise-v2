import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

const USER_PROGRESS_KEY = 'Ingrewise_user_progress_v1';

// Define level thresholds
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000]; // Points needed for level 1, 2, 3, etc.

interface UserProgress {
  points: number;
}

interface UserProgressContextType {
  points: number;
  level: number;
  addPoints: (amount: number) => void;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

const calculateLevel = (points: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

export const UserProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>({ points: 0 });
  const [level, setLevel] = useState(1);

  useEffect(() => {
    try {
      const storedProgress = localStorage.getItem(USER_PROGRESS_KEY);
      if (storedProgress) {
        const parsedProgress = JSON.parse(storedProgress);
        setProgress(parsedProgress);
        setLevel(calculateLevel(parsedProgress.points));
      }
    } catch (error) {
      console.error("Failed to load user progress from localStorage", error);
    }
  }, []);

  const saveProgress = (newProgress: UserProgress) => {
    try {
      localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
      setLevel(calculateLevel(newProgress.points));
    } catch (error) {
      console.error("Failed to save user progress to localStorage", error);
    }
  };
  
  const addPoints = useCallback((amount: number) => {
    setProgress(prevProgress => {
      const newPoints = prevProgress.points + amount;
      const newProgress = { ...prevProgress, points: newPoints };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  return (
    <UserProgressContext.Provider value={{ points: progress.points, level, addPoints }}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = (): UserProgressContextType => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUser-progress must be used within a User-progressProvider');
  }
  return context;
};