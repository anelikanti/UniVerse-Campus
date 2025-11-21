import { GoogleGenAI } from '@google/genai';
import { API_KEY_WARNING } from '../constants';

export const geminiService = {
  generateEventProposal: async (initialDetails: string): Promise<string> => {
    if (!process.env.API_KEY) {
      console.warn(API_KEY_WARNING);
      throw new Error(API_KEY_WARNING);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are an event planning assistant. Generate a detailed and engaging event proposal based on the following initial details. Include a catchy title, a compelling description, key highlights, target audience, and potential benefits. Ensure the tone is professional yet exciting.

Initial details:
${initialDetails}

Format the response in Markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Chosen for complex text generation
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 800,
          thinkingConfig: { thinkingBudget: 400 }, // Reserve tokens for thinking
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No text content received from Gemini API.");
      }
      return text;
    } catch (error) {
      console.error('Error generating event proposal:', error);
      throw new Error(`Failed to generate proposal: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};
