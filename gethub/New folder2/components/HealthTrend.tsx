import React from 'react';
import { type HistoryItem } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { getScoreColor } from './ScoreRing';

interface HealthTrendProps {
  history: HistoryItem[];
}

const HealthTrend: React.FC<HealthTrendProps> = ({ history }) => {
  const { t } = useTranslation();

  if (history.length < 2) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg mb-4 text-center">
        <p className="text-gray-400">{t('healthTrendNotEnoughData')}</p>
      </div>
    );
  }

  const averageScore = Math.round(history.reduce((acc, item) => acc + item.overallScore, 0) / history.length);
  
  // Use the last 10 items for the chart, reversed to show oldest to newest
  const chartData = history.slice(0, 10).reverse();
  const maxScore = 100;

  return (
    <div className="p-4 bg-gray-800 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-gray-200 mb-3 text-center">{t('healthTrendTitle')}</h3>
      <div className="flex items-center justify-center gap-4 mb-4">
        <p className="text-gray-400">{t('healthTrendAverage')}:</p>
        <p className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}</p>
      </div>
      <div className="h-24 w-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${chartData.length * 20} 100`} preserveAspectRatio="none">
          <line x1="0" y1="100" x2={chartData.length * 20} y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {chartData.map((item, index) => {
            const barHeight = (item.overallScore / maxScore) * 100;
            const scoreColorClass = getScoreColor(item.overallScore);

            return (
              <g key={item.id} className={scoreColorClass}>
                <rect
                  x={index * 20 + 2.5}
                  y={100 - barHeight}
                  width="15"
                  height={barHeight}
                  rx="3"
                  fill="currentColor"
                  className="transition-all duration-500"
                />
                <title>{`${item.productName}: ${item.overallScore}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default HealthTrend;
