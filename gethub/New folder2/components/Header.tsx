import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { HistoryIcon, StarIcon, SparklesIcon } from './Icons';
import { useUserProgress } from '../contexts/UserProgressContext';

interface HeaderProps {
  onHistoryClick: () => void;
  historyCount: number;
}

const Header: React.FC<HeaderProps> = ({ onHistoryClick, historyCount }) => {
  const { t } = useTranslation();
  const { points, level } = useUserProgress();

  return (
    <header className="w-full p-4 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50 ring-1 ring-white/10">
      <div className="flex items-center gap-3">
        <div className="bg-[rgb(var(--color-accent-dark))]/20 p-2 rounded-lg ring-1 ring-[rgb(var(--color-accent-base))]/30">
          <SparklesIcon className="h-6 w-6 text-[rgb(var(--color-accent-light))]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('headerTitle')}</h1>
          <p className="text-sm text-gray-400">{t('headerSubtitle')}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 bg-gray-800/50 px-3 py-1.5 rounded-full ring-1 ring-white/10">
            <div className="flex items-center gap-2" title={`${points} ${t('points')}`}>
                <StarIcon />
                <span className="font-bold text-white">{points}</span>
            </div>
            <div className="w-px h-5 bg-gray-600"></div>
            <div title={`${t('level')} ${level}`}>
                <span className="font-bold text-sm text-gray-300 mr-1">{t('level')}</span>
                <span className="font-bold text-white">{level}</span>
            </div>
        </div>
        <button
          onClick={onHistoryClick}
          className="relative text-gray-300 hover:text-white transition-colors"
          aria-label={t('history')}
        >
          <HistoryIcon />
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[rgb(var(--color-accent-base))] text-xs font-bold text-white">
              {historyCount}
            </span>
          )}
        </button>
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </header>
  );
};

export default Header;