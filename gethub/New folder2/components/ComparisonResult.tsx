import React from 'react';
import { type AnalysisResult as AnalysisResultType } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ScoreRing, getScoreColor } from './ScoreRing';
import ShareButtons from './ShareButtons';
import ComparisonTable from './ComparisonTable';

interface ComparisonResultProps {
  productA: AnalysisResultType;
  productB: AnalysisResultType;
  onReset: () => void;
}

const ComparisonSummary: React.FC<{productA: AnalysisResultType, productB: AnalysisResultType}> = ({ productA, productB }) => {
    const { t } = useTranslation();
    const winner = productA.overallScore > productB.overallScore ? 'A' : productB.overallScore > productA.overallScore ? 'B' : 'TIE';

    if (winner === 'TIE') {
        return (
            <div className="text-center p-4 bg-gray-800/50 ring-1 ring-white/10 rounded-2xl max-w-3xl mx-auto">
                <p className="text-lg text-gray-300">{t('tieReason')}</p>
            </div>
        );
    }
    
    const winnerProduct = winner === 'A' ? productA : productB;
    const loserProduct = winner === 'A' ? productB : productA;
    const reasons: string[] = [];

    if (winnerProduct.overallScore > loserProduct.overallScore) {
        reasons.push(t('reason_higher_score'));
    }

    const negativeDiff = loserProduct.negatives.length - winnerProduct.negatives.length;
    if (negativeDiff > 0) {
        reasons.push(t('reason_fewer_negatives').replace('{count}', String(negativeDiff)));
    }

    const positiveDiff = winnerProduct.positives.length - loserProduct.positives.length;
    if (positiveDiff > 0) {
        reasons.push(t('reason_more_positives').replace('{count}', String(positiveDiff)));
    }
    
    const questionableDiff = loserProduct.questionable.length - winnerProduct.questionable.length;
    if (questionableDiff > 0) {
         reasons.push(t('reason_fewer_questionable').replace('{count}', String(questionableDiff)));
    }

    return (
        <div className="text-center p-6 bg-gray-800/50 ring-1 ring-white/10 rounded-2xl max-w-3xl mx-auto space-y-3">
            <h4 className="text-xl font-bold text-[rgb(var(--color-accent-light))]">
              {t('whyProductWins').replace('{productName}', winnerProduct.productName)}
            </h4>
            <ul className="list-inside list-disc text-left text-gray-300 space-y-1 mx-auto max-w-md">
                {reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                ))}
            </ul>
        </div>
    );
};


const ComparisonCard: React.FC<{product: AnalysisResultType, isWinner: boolean, isTie: boolean}> = ({ product, isWinner, isTie }) => {
    const { t } = useTranslation();
    const scoreColor = getScoreColor(product.overallScore);

    return (
        <div className={`relative flex-1 p-6 bg-gray-800/50 ring-1 ${isWinner ? 'ring-[rgb(var(--color-accent-base))] scale-105' : 'ring-white/10'} rounded-2xl shadow-lg flex flex-col items-center gap-4 transition-all duration-300`}>
            {isWinner && (
                <div className="absolute -top-4 bg-[rgb(var(--color-accent-base))] text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg z-10">
                    {t('winner')}
                </div>
            )}
            {isTie && (
                 <div className="absolute -top-4 bg-yellow-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg z-10">
                    {t('tie')}
                </div>
            )}
            <h3 className="text-2xl font-bold text-gray-200 text-center h-16 flex items-center justify-center">{product.productName}</h3>
            <ScoreRing score={product.overallScore} />
            <p className={`text-2xl font-semibold ${scoreColor}`}>{product.verdict}</p>
            <p className="text-gray-400 text-center text-sm flex-grow min-h-[4rem]">{product.summary}</p>
            <div className="w-full text-left space-y-2 mt-4 text-sm pt-4 border-t border-white/10">
                <div className="flex justify-between items-center"><span className="text-red-400 font-semibold">{t('negativeIngredients')}</span> <span className="font-mono bg-red-900/30 text-red-300 rounded px-2 py-1">{product.negatives.length}</span></div>
                <div className="flex justify-between items-center"><span className="text-yellow-400 font-semibold">{t('questionableIngredients')}</span> <span className="font-mono bg-yellow-900/30 text-yellow-300 rounded px-2 py-1">{product.questionable.length}</span></div>
                <div className="flex justify-between items-center"><span className="text-green-400 font-semibold">{t('positiveIngredients')}</span> <span className="font-mono bg-green-900/30 text-green-300 rounded px-2 py-1">{product.positives.length}</span></div>
            </div>
        </div>
    );
};

const ComparisonResult: React.FC<ComparisonResultProps> = ({ productA, productB, onReset }) => {
    const { t } = useTranslation();
    const winner = productA.overallScore > productB.overallScore ? 'A' : productB.overallScore > productA.overallScore ? 'B' : 'TIE';

    return (
        <div className="w-full space-y-8">
            <h2 className="text-4xl font-bold text-center text-gray-200">{t('comparisonResult')}</h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-stretch">
                <ComparisonCard product={productA} isWinner={winner === 'A'} isTie={winner === 'TIE'}/>
                <ComparisonCard product={productB} isWinner={winner === 'B'} isTie={winner === 'TIE'}/>
            </div>
            
            <ComparisonSummary productA={productA} productB={productB} />

            <ComparisonTable productA={productA} productB={productB} />

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={onReset}
                    className="bg-[rgb(var(--color-accent-dark))] hover:bg-[rgb(var(--color-accent-darker))] text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105"
                >
                    {t('startNewAnalysis')}
                </button>
                <ShareButtons productA={productA} productB={productB} />
            </div>
        </div>
    );
}

export default ComparisonResult;