import React from 'react';
import { useHealthGoal } from '../contexts/HealthGoalContext';
import { type HealthGoal } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { HeartIcon, ScaleIcon, DumbbellIcon } from './Icons';

const HealthGoalSelector: React.FC = () => {
  const { healthGoal, setHealthGoal } = useHealthGoal();
  const { t } = useTranslation();

  const goals: { id: HealthGoal; labelKey: 'goal_general' | 'goal_weight_loss' | 'goal_muscle_gain'; icon: React.ReactElement }[] = [
    { id: 'general', labelKey: 'goal_general', icon: <HeartIcon /> },
    { id: 'weight_loss', labelKey: 'goal_weight_loss', icon: <ScaleIcon /> },
    { id: 'muscle_gain', labelKey: 'goal_muscle_gain', icon: <DumbbellIcon /> },
  ];
  
  const baseClasses = "flex-1 flex flex-col items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105";
  const activeClasses = "bg-[rgb(var(--color-accent-dark))] ring-2 ring-offset-2 ring-offset-gray-900 ring-[rgb(var(--color-accent-base))]";
  const inactiveClasses = "bg-gray-700 hover:bg-gray-600";


  return (
    <div className="w-full max-w-md p-4 bg-gray-800/50 ring-1 ring-white/10 rounded-2xl mb-8">
        <h2 className="text-lg font-semibold text-center mb-4 text-gray-300">{t('whatsYourGoal')}</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            {goals.map(goal => (
                <button
                    key={goal.id}
                    onClick={() => setHealthGoal(goal.id)}
                    className={`${baseClasses} ${healthGoal === goal.id ? activeClasses : inactiveClasses}`}
                >
                    {goal.icon}
                    <span>{t(goal.labelKey)}</span>
                </button>
            ))}
        </div>
    </div>
  );
};

export default HealthGoalSelector;