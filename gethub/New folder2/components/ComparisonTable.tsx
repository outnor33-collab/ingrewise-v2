import React from 'react';
import { type AnalysisResult } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ComparisonTableProps {
  productA: AnalysisResult;
  productB: AnalysisResult;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ productA, productB }) => {
  const { t } = useTranslation();

  const allNutrients = new Set([
    ...(productA.nutritionalFacts || []).map(f => f.nutrient),
    ...(productB.nutritionalFacts || []).map(f => f.nutrient)
  ]);

  if (allNutrients.size === 0) return null;

  return (
    <div className="p-6 bg-gray-800/50 ring-1 ring-white/10 rounded-2xl max-w-3xl mx-auto w-full">
      <h4 className="text-xl font-bold text-center mb-4 text-sky-400">{t('nutritionalFacts')}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/20">
              <th scope="col" className="py-2 px-2 font-semibold text-gray-300">Nutrient</th>
              <th scope="col" className="py-2 px-2 text-center font-semibold text-gray-300 truncate">{productA.productName}</th>
              <th scope="col" className="py-2 px-2 text-center font-semibold text-gray-300 truncate">{productB.productName}</th>
            </tr>
          </thead>
          <tbody>
            {[...allNutrients].map(nutrient => {
              const factA = (productA.nutritionalFacts || []).find(f => f.nutrient === nutrient);
              const factB = (productB.nutritionalFacts || []).find(f => f.nutrient === nutrient);
              return (
                <tr key={nutrient} className="border-b border-white/10 last:border-b-0">
                  <td className="py-2 px-2 font-medium text-gray-400">{nutrient}</td>
                  <td className="py-2 px-2 text-center font-mono text-gray-200">{factA ? `${factA.value}${factA.unit}` : '-'}</td>
                  <td className="py-2 px-2 text-center font-mono text-gray-200">{factB ? `${factB.value}${factB.unit}` : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
