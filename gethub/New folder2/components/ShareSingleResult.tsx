import React, { useState, useCallback, useMemo } from 'react';
import { type AnalysisResult as AnalysisResultType } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ShareIcon, CopyIcon } from './Icons';

interface ShareSingleResultProps {
  result: AnalysisResultType;
}

const ShareSingleResult: React.FC<ShareSingleResultProps> = ({ result }) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const summaryText = useMemo(() => {
    return t('shareSingleSummary')
      .replace('{productName}', result.productName)
      .replace('{score}', String(result.overallScore))
      .replace('{verdict}', result.verdict)
      .replace('{summary}', result.summary);
  }, [result, t]);

  const handleShare = useCallback(async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: t('shareSingleTitle'),
        text: summaryText,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [canShare, summaryText, t]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(summaryText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }, [summaryText]);

  return (
    <>
      {canShare && (
        <button
          onClick={handleShare}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          title={t('shareAnalysis')}
        >
          <ShareIcon />
          <span>{t('share')}</span>
        </button>
      )}
      <button
        onClick={handleCopy}
        className={`font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
          isCopied
            ? 'bg-green-600 text-white'
            : 'bg-gray-600 hover:bg-gray-700 text-white'
        }`}
        disabled={isCopied}
        title={t('copyToClipboard')}
      >
        <CopyIcon />
        <span>{isCopied ? t('copied') : t('copyToClipboard')}</span>
      </button>
    </>
  );
};

export default ShareSingleResult;
