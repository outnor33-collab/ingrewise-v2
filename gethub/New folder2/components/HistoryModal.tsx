import React from 'react';
import { type HistoryItem } from '../types';
import { useHistory } from '../hooks/useHistory';
import { useTranslation } from '../hooks/useTranslation';
import { getScoreColor } from './ScoreRing';
import HealthTrend from './HealthTrend';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (item: HistoryItem) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onLoad }) => {
  const { history, clearHistory } = useHistory();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        clearHistory();
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 ring-1 ring-white/10 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col p-6 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{t('history')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
          {history.length > 0 ? (
            <>
              <HealthTrend history={history} />
              <ul className="space-y-3">
                {history.map(item => (
                  <li key={item.id} className="p-3 bg-gray-800 rounded-lg flex items-center justify-between gap-4">
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-200 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-bold ${getScoreColor(item.overallScore)}`}>{item.overallScore}</span>
                      <button 
                        onClick={() => onLoad(item)}
                        className="text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition"
                      >
                        {t('loadFromHistory')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('noHistory')}</p>
          )}
        </div>
        
        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={handleClearHistory}
              className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {t('clearHistory')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;