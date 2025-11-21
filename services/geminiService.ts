import { GoogleGenAI } from '@google/genai';
import { API_KEY_WARNING } from '../constants';

/**
 * @file services/geminiService.ts
 * @brief Provides an interface to interact with the Google Gemini AI for event proposal generation.
 *
 * This service encapsulates the logic for calling the Gemini API, including
 * API key validation, constructing prompts, and handling responses and errors.
 */

/**
 * An object providing methods to interact with the Gemini AI model.
 */
export const geminiService = {
  /**
   * Asynchronously generates an event proposal using the Gemini AI model.
   * The proposal is based on initial details provided by the organizer,
   * producing a detailed and engaging markdown-formatted response.
   *
   * @param {string} initialDetails A string containing the initial information or brief idea for the event.
   * @returns {Promise<string>} A promise that resolves with the AI-generated event proposal in Markdown format.
   * @throws {Error} If the Gemini API key is not configured or if the API call fails.
   */
  generateEventProposal: async (initialDetails: string): Promise<string> => {
    // Critical: Check for the presence of the API key before making any API calls.
    // Without an API key, AI features cannot function, and an error is thrown.
    if (!process.env.API_KEY) {
      console.warn(API_KEY_WARNING);
      throw new Error(API_KEY_WARNING);
    }

    try {
      // Initialize the GoogleGenAI client with the API key from environment variables.
      // This key is crucial for authenticating requests to the Gemini API.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Construct a detailed prompt for the AI model.
      // This prompt instructs the model on its role (event planning assistant)
      // and specifies the desired output format (catchy title, description, highlights, etc., in Markdown).
      const prompt = `You are an event planning assistant. Generate a detailed and engaging event proposal based on the following initial details. Include a catchy title, a compelling description, key highlights, target audience, and potential benefits. Ensure the tone is professional yet exciting.

Initial details:
${initialDetails}

Format the response in Markdown.`;

      // Call the Gemini model to generate content.
      // Using 'gemini-3-pro-preview' for complex text generation tasks,
      // as it's well-suited for detailed proposals requiring reasoning.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Specifies the AI model to use.
        contents: prompt, // The instructional prompt for the model.
        config: {
          temperature: 0.7, // Controls randomness; lower values make output more deterministic.
          maxOutputTokens: 800, // Limits the length of the generated response to manage cost and relevance.
          thinkingConfig: { thinkingBudget: 400 }, // Allocates tokens for the model's internal reasoning process.
        },
      });

      // Extract the text content from the AI's response.
      const text = response.text;

      // Validate that text content was actually received.
      if (!text) {
        throw new Error("No text content received from Gemini API.");
      }
      return text; // Return the generated Markdown proposal.
    } catch (error) {
      // Catch and log any errors that occur during the API call or response processing.
      console.error('Error generating event proposal:', error);
      // Re-throw a more user-friendly error message.
      throw new Error(`Failed to generate proposal: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};