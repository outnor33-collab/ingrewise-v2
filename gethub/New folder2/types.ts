export interface NutritionalFact {
  nutrient: string;
  value: string;
  unit: string;
}

export interface IngredientDetail {
  component: string;
  value: string;
  severity: string;
  penalty?: number;
  bonus?: number;
  description: string;
}

export interface AnalysisResult {
  productName: string;
  analysisConfidence: {
    productIdentification: string;
    ocrAccuracy: string;
    dataSource: string;
  };
  overallScore: number;
  verdict: string;
  summary: string;
  nutritionalFacts: NutritionalFact[];
  negatives: IngredientDetail[];
  positives: IngredientDetail[];
  questionable: IngredientDetail[];
  goalBasedRecommendation?: string;
  image?: {
    data: string;
    mimeType: string;
  };
}

export interface Alternative {
  productName: string;
  reasons: string[];
}

export type HealthGoal = 'general' | 'weight_loss' | 'muscle_gain';

export interface HistoryItem {
  id: string; // e.g., timestamp
  productName: string;
  overallScore: number;
  timestamp: number;
  result: AnalysisResult;
}