import React, { useState, useCallback } from 'react';
import { type AnalysisResult, type Alternative, type HistoryItem, type HealthGoal } from './types';
import { analyzeImage, getHealthierAlternatives } from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';
import { useHealthGoal } from './contexts/HealthGoalContext';
import { useTranslation } from './hooks/useTranslation';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import AnalysisResultComponent from './components/AnalysisResult';
import ComparisonResult from './components/ComparisonResult';
import HealthGoalSelector from './components/HealthGoalSelector';
import HistoryModal from './components/HistoryModal';
import { useHistory } from './hooks/useHistory';
import { TranslationKey } from './translations';
import { useUserProgress } from './contexts/UserProgressContext';

type AppState = 'idle' | 'analyzing' | 'result' | 'comparing' | 'comparison_result' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  
  const [productA, setProductA] = useState<AnalysisResult | null>(null);
  const [productB, setProductB] = useState<AnalysisResult | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[] | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFindingAlternatives, setIsFindingAlternatives] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { language } = useLanguage();
  const { healthGoal } = useHealthGoal();
  const { t } = useTranslation();
  const { history, addHistoryItem } = useHistory();
  const { addPoints } = useUserProgress();
  
  const resetState = useCallback(() => {
    setAppState('idle');
    setSelectedImage(null);
    setProductA(null);
    setProductB(null);
    setAlternatives(null);
    setIsLoading(false);
    setIsFindingAlternatives(false);
    setError(null);
  }, []);

  const handleImageSelect = (base64: string, mimeType: string) => {
    if (base64 && mimeType) {
      setSelectedImage({ data: base64, mimeType });
    } else {
      setSelectedImage(null);
    }
  };

  const handleAnalysis = useCallback(async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);
    setAppState('analyzing');
    setAlternatives(null);

    try {
      const basePromptKey = appState === 'comparing' ? 'comparisonPrompt' : 'analysisPrompt';
      let promptText = t(basePromptKey);

      // Add health goal to the prompt for more personalized analysis
      if (basePromptKey === 'analysisPrompt') {
        const goalMap: Record<HealthGoal, TranslationKey> = {
          general: 'goal_general',
          weight_loss: 'goal_weight_loss',
          muscle_gain: 'goal_muscle_gain'
        };
        const localizedGoal = t(goalMap[healthGoal]);
        promptText = t('analysisPromptWithGoal').replace('{healthGoal}', localizedGoal);
      }
      
      const result = await analyzeImage(selectedImage.data, selectedImage.mimeType, language, promptText);
      
      const resultWithImage = { ...result, image: selectedImage };

      if (appState === 'comparing' && productA) {
        setProductB(resultWithImage);
        setAppState('comparison_result');
        addHistoryItem(resultWithImage);
        addPoints(15); // More points for a comparison
      } else {
        setProductA(resultWithImage);
        setAppState('result');
        addHistoryItem(resultWithImage);
        addPoints(10); // Points for a single analysis
      }
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : 'error_generic';
      setError(t(errorMessage as any) || t('error_generic'));
      setAppState('error');
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
    }
  }, [selectedImage, language, t, productA, appState, addHistoryItem, healthGoal, addPoints]);
  
  const handleFindAlternatives = useCallback(async (product: AnalysisResult, goal: typeof healthGoal) => {
      setIsFindingAlternatives(true);
      setError(null);
      try {
          const alts = await getHealthierAlternatives(product, language, goal);
          setAlternatives(alts);
      } catch (e: any) {
        const errorMessage = e instanceof Error ? e.message : 'error_generic';
        setError(t(errorMessage as any) || t('error_generic'));
      } finally {
          setIsFindingAlternatives(false);
      }
  }, [language, t]);

  const handleStartCompare = () => {
    setAppState('comparing');
    setSelectedImage(null);
  };
  
  const handleLoadFromHistory = (item: HistoryItem) => {
    setIsHistoryOpen(false);
    if(appState === 'comparing' && productA) {
        setProductB(item.result);
        setAppState('comparison_result');
    } else {
        setProductA(item.result);
        setAppState('result');
        setAlternatives(null); // Clear alternatives when loading from history
    }
  };

  const renderContent = () => {
    if (isLoading || appState === 'analyzing') {
      return (
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-lg text-gray-300 animate-pulse">{t('analyzing')}</p>
        </div>
      );
    }
    
    if (appState === 'error' && error) {
      return (
        <div className="w-full max-w-md p-6 bg-red-900/50 ring-1 ring-red-500/50 rounded-2xl text-center">
          <h3 className="text-xl font-bold text-red-300 mb-2">Error</h3>
          <p className="text-red-300/80 mb-6">{error}</p>
          <button onClick={resetState} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">
            {t('startNewAnalysis')}
          </button>
        </div>
      );
    }
    
    if (appState === 'result' && productA) {
      return (
        <AnalysisResultComponent
          result={productA}
          onFindAlternatives={handleFindAlternatives}
          onCompare={handleStartCompare}
          onReset={resetState}
          alternatives={alternatives}
          isFindingAlternatives={isFindingAlternatives}
        />
      );
    }
    
    if (appState === 'comparison_result' && productA && productB) {
        return <ComparisonResult productA={productA} productB={productB} onReset={resetState} />;
    }

    // Default state: 'idle' or 'comparing'
    return (
      <>
        <HealthGoalSelector />
        <ImageUploader 
          onImageSelect={handleImageSelect}
          onAnalyze={handleAnalysis}
          selectedImage={selectedImage}
          isComparing={appState === 'comparing'}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center">
      <Header onHistoryClick={() => setIsHistoryOpen(true)} historyCount={history.length} />
      <main className="w-full flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
        <div key={appState} className="w-full flex-grow flex flex-col items-center justify-center animate-fade-in-up">
          {renderContent()}
        </div>
      </main>
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onLoad={handleLoadFromHistory} />
    </div>
  );
};

export default App;