import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const geminiClient = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const GEMINI_MODEL_TEXT = 'gemini-1.5-flash';
export const GEMINI_MODEL_VISION = 'gemini-1.5-flash';

export function isGeminiConfigured(): boolean {
  return Boolean(apiKey && apiKey.length > 5);
}
