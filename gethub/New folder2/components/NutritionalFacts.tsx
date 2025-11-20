import React from 'react';
import { type NutritionalFact } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface NutritionalFactsProps {
  facts: NutritionalFact[];
}

const NutritionalFacts: React.FC<NutritionalFactsProps> = ({ facts }) => {
  const { t } = useTranslation();

  if (!facts || facts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 ring-1 ring-white/10 rounded-xl p-4">
      <h4 className="text-lg font-semibold mb-3 text-sky-400">{t('nutritionalFacts')}</h4>
      <ul className="space-y-2 text-sm">
        {facts.map((fact, index) => (
          <li key={index} className="flex justify-between items-baseline border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
            <span className="text-gray-300">{fact.nutrient}</span>
            <span className="font-mono font-semibold text-gray-200">{fact.value}{fact.unit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NutritionalFacts;
