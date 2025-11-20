import React, { createContext, useState, useContext, ReactNode } from 'react';
import { type HealthGoal } from '../types';

interface HealthGoalContextType {
  healthGoal: HealthGoal;
  setHealthGoal: (goal: HealthGoal) => void;
}

const HealthGoalContext = createContext<HealthGoalContextType | undefined>(undefined);

export const HealthGoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [healthGoal, setHealthGoal] = useState<HealthGoal>('general');

  return (
    <HealthGoalContext.Provider value={{ healthGoal, setHealthGoal }}>
      {children}
    </HealthGoalContext.Provider>
  );
};

export const useHealthGoal = (): HealthGoalContextType => {
  const context = useContext(HealthGoalContext);
  if (!context) {
    throw new Error('useHealthGoal must be used within a HealthGoalProvider');
  }
  return context;
};