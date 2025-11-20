import React, { useState, useCallback, useMemo } from 'react';
import { type AnalysisResult as AnalysisResultType } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ShareIcon, CopyIcon } from './Icons';

interface ShareButtonsProps {
  productA: AnalysisResultType;
  productB: AnalysisResultType;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ productA, productB }) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const summaryText = useMemo(() => {
    const winner = productA.overallScore > productB.overallScore ? 'A' : productB.overallScore > productA.overallScore ? 'B' : 'TIE';
    if (winner === 'TIE') {
      return t('shareSummaryTie')
        .replace('{productA}', productA.productName)
        .replace('{productB}', productB.productName)
        .replace('{score}', String(productA.overallScore));
    }
    
    const winnerProduct = winner === 'A' ? productA : productB;
    const loserProduct = winner === 'A' ? productB : productA;

    return t('shareSummaryWinner')
      .replace('{productA}', productA.productName)
      .replace('{productB}', productB.productName)
      .replace('{winnerProduct}', winnerProduct.productName)
      .replace('{winnerScore}', String(winnerProduct.overallScore))
      .replace('{loserScore}', String(loserProduct.overallScore));
  }, [productA, productB, t]);

  const handleShare = useCallback(async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: t('shareTitle'),
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
    <div className="flex items-center gap-4">
      {canShare && (
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105"
          title={t('shareResult')}
        >
          <ShareIcon />
          <span className="hidden sm:inline">{t('shareResult')}</span>
        </button>
      )}
      <button
        onClick={handleCopy}
        className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 ${
          isCopied
            ? 'bg-green-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
        disabled={isCopied}
        title={t('copyToClipboard')}
      >
        <CopyIcon />
        <span className="hidden sm:inline">{isCopied ? t('copied') : t('copyToClipboard')}</span>
      </button>
    </div>
  );
};

export default ShareButtons;
