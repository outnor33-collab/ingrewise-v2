import { GoogleGenAI, Type } from "@google/genai";
import { getSystemInstruction } from '../constants';
import { type AnalysisResult, type Alternative, type HealthGoal } from '../types';
import { translations, type Language, type TranslationKey } from "../translations";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// FIX: Define a structured response schema for the analysis result to ensure consistent JSON output.
const analysisResultSchema = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING },
        analysisConfidence: {
            type: Type.OBJECT,
            properties: {
                productIdentification: { type: Type.STRING },
                ocrAccuracy: { type: Type.STRING },
                dataSource: { type: Type.STRING },
            },
            required: ['productIdentification', 'ocrAccuracy', 'dataSource']
        },
        overallScore: { type: Type.INTEGER },
        verdict: { type: Type.STRING },
        summary: { type: Type.STRING },
        nutritionalFacts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    nutrient: { type: Type.STRING },
                    value: { type: Type.STRING },
                    unit: { type: Type.STRING },
                },
                required: ['nutrient', 'value', 'unit']
            }
        },
        negatives: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    component: { type: Type.STRING },
                    value: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    penalty: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                },
                required: ['component', 'value', 'severity', 'description']
            }
        },
        positives: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    component: { type: Type.STRING },
                    value: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    bonus: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                },
                required: ['component', 'value', 'severity', 'description']
            }
        },
        questionable: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    component: { type: Type.STRING },
                    value: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    penalty: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                },
                required: ['component', 'value', 'severity', 'description']
            }
        },
        goalBasedRecommendation: { type: Type.STRING },
    },
    required: ['productName', 'analysisConfidence', 'overallScore', 'verdict', 'summary', 'nutritionalFacts', 'negatives', 'positives', 'questionable']
};


export async function analyzeImage(imageBase64: string, mimeType: string, language: Language, promptText: string): Promise<AnalysisResult> {
  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType,
    },
  };

  const textPart = {
    text: promptText,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: getSystemInstruction(language),
        responseMimeType: "application/json",
        // FIX: Use the structured response schema instead of embedding it in the prompt.
        responseSchema: analysisResultSchema,
      },
    });
    
    const jsonText = response.text.trim();
    
    const cleanedJsonText = jsonText.startsWith('```json') 
      ? jsonText.replace(/^```json\s*|```$/g, '')
      : jsonText;

    try {
      const result = JSON.parse(cleanedJsonText);
      return result as AnalysisResult;
    } catch (e) {
      console.error("Failed to parse JSON response:", cleanedJsonText);
      throw new Error("error_parsing_response");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "error_parsing_response") {
        throw error;
    }
    console.error("Error calling Gemini API:", error);
    throw new Error("error_api_connection");
  }
}

export async function getHealthierAlternatives(product: AnalysisResult, language: Language, healthGoal: HealthGoal): Promise<Alternative[]> {
  const t = (key: TranslationKey) => translations[language][key] || key;
  const negativeIngredients = product.negatives.map(neg => neg.component).join(', ');
  
  const goalMap: Record<HealthGoal, TranslationKey> = {
    general: 'goal_general',
    weight_loss: 'goal_weight_loss',
    muscle_gain: 'goal_muscle_gain'
  }
  const localizedGoal = t(goalMap[healthGoal]);

  const prompt = t('alternativesPrompt')
    .replace('{productName}', product.productName)
    .replace('{negativeIngredients}', negativeIngredients)
    .replace('{healthGoal}', localizedGoal);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              reasons: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                }
              }
            },
            required: ["productName", "reasons"]
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.startsWith('```json') 
      ? jsonText.replace(/^```json\s*|```$/g, '')
      : jsonText;

    try {
      const result = JSON.parse(cleanedJsonText);
      return result as Alternative[];
    } catch (e) {
      console.error("Failed to parse alternatives JSON response:", cleanedJsonText);
      throw new Error("error_parsing_response");
    }

  } catch (error) {
     if (error instanceof Error && error.message === "error_parsing_response") {
        throw error;
    }
    console.error("Error calling Gemini API for alternatives:", error);
    throw new Error("error_api_connection");
  }
}