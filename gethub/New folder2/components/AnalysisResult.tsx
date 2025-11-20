import React, { useState, useCallback, useId } from 'react';
import { type AnalysisResult as AnalysisResultType, type Alternative, type HealthGoal, type IngredientDetail } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ScoreRing, getScoreColor } from './ScoreRing';
import ZoomableImage from './ZoomableImage';
import Spinner from './Spinner';
import { useHealthGoal } from '../contexts/HealthGoalContext';
import { LightbulbIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon } from './Icons';
import ShareSingleResult from './ShareSingleResult';
import NutritionalFacts from './NutritionalFacts';
import { TranslationKey } from '../translations';
import OverallFeedback from './OverallFeedback';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const AlternativeFeedback: React.FC = () => {
    const { t } = useTranslation();
    const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

    if (feedback) {
        return <p className="text-sm text-gray-400 mt-2">{t('feedbackThanks')}</p>;
    }

    return (
        <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-gray-400">{t('wasAlternativeHelpful')}</p>
            <button
                onClick={() => setFeedback('helpful')}
                className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-full transition-colors"
                aria-label={t('helpful')}
                title={t('helpful')}
            >
                <ThumbsUpIcon />
            </button>
            <button
                onClick={() => setFeedback('not_helpful')}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
                aria-label={t('notHelpful')}
                title={t('notHelpful')}
            >
                <ThumbsDownIcon />
            </button>
        </div>
    );
};

const AlternativeItem: React.FC<{ alternative: Alternative }> = ({ alternative }) => {
    const { t } = useTranslation();
    const [isCopied, setIsCopied] = useState(false);

    const shareText = `${t('shareAlternative')} ${alternative.productName}. ${t('reasons')}: ${alternative.reasons.join(', ')}.`;

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(shareText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }, [shareText]);

    return (
        <li className="border-b border-white/10 pb-4 pt-2 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                    <p className="font-semibold text-gray-200">{alternative.productName}</p>
                     <ul className="mt-2 space-y-1 pl-4">
                        {alternative.reasons.map((reason, i) => (
                             <li key={i} className="text-sm text-emerald-300/90 list-disc list-outside">
                                {reason}
                            </li>
                        ))}
                    </ul>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                    aria-label={t('share')}
                    title={isCopied ? t('copied') : t('share')}
                >
                    {isCopied ? (
                        <CheckIcon className="h-5 w-5 text-green-400" />
                    ) : (
                        <ShareIcon />
                    )}
                </button>
            </div>
            <AlternativeFeedback />
        </li>
    );
}

const ExpandableIngredientItem: React.FC<{ item: IngredientDetail }> = ({ item }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const uniqueId = useId();

    const severityClasses: Record<string, string> = {
        'High': 'bg-red-900/50 text-red-300 ring-1 ring-red-400/30',
        'Moderate': 'bg-yellow-900/50 text-yellow-300 ring-1 ring-yellow-400/30',
        'Low': 'bg-sky-900/50 text-sky-300 ring-1 ring-sky-400/30',
        'Beneficial': 'bg-green-900/50 text-green-300 ring-1 ring-green-400/30',
        'Neutral': 'bg-gray-700/50 text-gray-300 ring-1 ring-gray-400/30',
    };

    const normalizedSeverity = item.severity ? item.severity.charAt(0).toUpperCase() + item.severity.slice(1).toLowerCase() : '';
    const badgeClasses = severityClasses[normalizedSeverity] || 'bg-gray-700/50 text-gray-300 ring-1 ring-gray-400/30';
    
    const severityKey = item.severity ? `severity_${item.severity.toLowerCase()}` as TranslationKey : null;

    return (
        <li className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center text-left hover:bg-gray-700/50 p-2 -m-2 rounded-md transition-colors"
                aria-expanded={isExpanded}
                aria-controls={uniqueId}
            >
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="group relative font-semibold text-gray-200">
                        {item.component}
                        {!isExpanded && (
                            <div role="tooltip" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-950 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 ring-1 ring-white/20">
                                {item.description}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-950"></div>
                            </div>
                        )}
                    </span>
                    {severityKey && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeClasses}`}>
                            {t(severityKey)}
                        </span>
                    )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 shrink-0 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            <div
                id={uniqueId}
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="pt-3 pl-4 pr-2 space-y-3">
                        <div className="border-l-2 border-gray-600 pl-4">
                            <p className="text-gray-400">{item.description}</p>
                        </div>
                        {(item.penalty || item.bonus) && (
                            <div className="border-l-2 border-gray-600 pl-4">
                                <p className="text-sm font-semibold text-gray-300">
                                    {t('scoreImpact')}: 
                                    <span className={`font-mono ml-2 px-2 py-0.5 rounded ${item.penalty ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                                       {item.penalty ? `-${item.penalty}` : `+${item.bonus}`}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
};

const IngredientList: React.FC<{ title: string; items: IngredientDetail[]; color: string }> = ({ title, items, color }) => (
  <div className="bg-gray-800/50 ring-1 ring-white/10 rounded-xl p-4">
    <h4 className={`text-lg font-semibold mb-3 ${color}`}>{title}</h4>
    {items.length > 0 ? (
      <ul className="space-y-3 text-sm">
        {items.map((item, index) => (
          <ExpandableIngredientItem key={index} item={item} />
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-sm">None found.</p>
    )}
  </div>
);

const GoalRecommendation: React.FC<{ recommendation: string }> = ({ recommendation }) => {
    const { t } = useTranslation();
    return (
        <div className="p-4 bg-sky-900/50 ring-1 ring-sky-400/30 rounded-xl flex items-start gap-4">
            <div className="flex-shrink-0 text-sky-300 mt-1">
                <LightbulbIcon />
            </div>
            <div>
                <h4 className="font-semibold text-sky-300">{t('goalBasedRecommendationTitle')}</h4>
                <p className="text-sky-200/90 text-sm">{recommendation}</p>
            </div>
        </div>
    );
};

// FIX: Define the missing 'AnalysisResultProps' interface.
interface AnalysisResultProps {
  result: AnalysisResultType;
  onFindAlternatives: (product: AnalysisResultType, goal: HealthGoal) => void;
  onCompare: () => void;
  onReset: () => void;
  alternatives: Alternative[] | null;
  isFindingAlternatives: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onFindAlternatives, onCompare, onReset, alternatives, isFindingAlternatives }) => {
  const { t } = useTranslation();
  const { healthGoal } = useHealthGoal();

  const scoreColor = getScoreColor(result.overallScore);
  const goalMap: Record<HealthGoal, 'goal_general' | 'goal_weight_loss' | 'goal_muscle_gain'> = {
    general: 'goal_general',
    weight_loss: 'goal_weight_loss',
    muscle_gain: 'goal_muscle_gain'
  };
  const localizedGoal = t(goalMap[healthGoal]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-200">{t('analysisResult')}</h2>
      </div>
      
      <div className="p-3 bg-gray-800/50 ring-1 ring-white/10 rounded-xl text-center">
        <p className="text-sm text-gray-300">{t('analysisForYourGoal').replace('{healthGoal}', localizedGoal)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          {result.image && (
            <ZoomableImage 
              src={`data:${result.image.mimeType};base64,${result.image.data}`}
              alt={`${result.productName} ingredients list`}
              ariaLabel={`${result.productName} ingredients list`}
            />
          )}
          <div className="p-6 bg-gray-800/50 ring-1 ring-white/10 rounded-2xl flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-gray-200 mb-4">{result.productName}</h3>
            <ScoreRing score={result.overallScore} />
            <p className={`text-3xl font-bold mt-4 ${scoreColor}`}>{result.verdict}</p>
            <p className="text-gray-400 mt-2">{result.summary}</p>
          </div>
        </div>

        <div className="space-y-6">
          {result.goalBasedRecommendation && <GoalRecommendation recommendation={result.goalBasedRecommendation} />}
          <NutritionalFacts facts={result.nutritionalFacts} />
          <IngredientList title={t('negativeIngredients')} items={result.negatives} color="text-red-400" />
          <IngredientList title={t('questionableIngredients')} items={result.questionable} color="text-yellow-400" />
          <IngredientList title={t('positiveIngredients')} items={result.positives} color="text-green-400" />
        </div>
      </div>
      
      {alternatives && (
        <div className="p-6 bg-gray-800/50 ring-1 ring-white/10 rounded-2xl">
          <h4 className="text-xl font-bold text-center mb-4 text-[rgb(var(--color-accent-light))]">{t('healthierAlternatives')}</h4>
          <ul className="space-y-2">
            {alternatives.map((alt, index) => (
              <AlternativeItem key={index} alternative={alt} />
            ))}
          </ul>
        </div>
      )}
      
      <OverallFeedback />

      <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
        {!alternatives && (
            <button
                onClick={() => onFindAlternatives(result, healthGoal)}
                disabled={isFindingAlternatives}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center min-w-[240px]"
            >
                {isFindingAlternatives ? <Spinner /> : t('getHealthierAlternatives')}
            </button>
        )}
        <button
            onClick={onCompare}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
        >
            {t('compareWithAnother')}
        </button>
        <ShareSingleResult result={result} />
         <button
            onClick={onReset}
            className="bg-[rgb(var(--color-accent-dark))] hover:bg-[rgb(var(--color-accent-darker))] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
        >
            {t('startNewAnalysis')}
        </button>
      </div>
    </div>
  );
};

export default AnalysisResult;
