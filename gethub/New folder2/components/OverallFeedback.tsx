import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ThumbsUpIcon, ThumbsDownIcon } from './Icons';

const OverallFeedback: React.FC = () => {
    const { t } = useTranslation();
    const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

    return (
        <div className="p-4 bg-gray-800/50 ring-1 ring-white/10 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-4">
            {feedback ? (
                <p className="text-lg text-green-300">{t('feedbackThanks')}</p>
            ) : (
                <>
                    <h4 className="text-lg font-semibold text-gray-200">{t('wasAnalysisHelpful')}</h4>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setFeedback('helpful')}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-green-800/50 text-white font-bold py-2 px-4 rounded-lg transition-colors ring-1 ring-inset ring-gray-600 hover:ring-green-500"
                            aria-label={t('helpful')}
                        >
                            <ThumbsUpIcon />
                            <span>{t('helpful')}</span>
                        </button>
                        <button
                            onClick={() => setFeedback('not_helpful')}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-red-800/50 text-white font-bold py-2 px-4 rounded-lg transition-colors ring-1 ring-inset ring-gray-600 hover:ring-red-500"
                            aria-label={t('notHelpful')}
                        >
                            <ThumbsDownIcon />
                             <span>{t('notHelpful')}</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default OverallFeedback;