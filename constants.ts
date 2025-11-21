/**
 * @file constants.ts
 * @brief Defines global constants used across the UniVerse application.
 *
 * This file centralizes important immutable values, such as warning messages,
 * to promote consistency and easier maintenance.
 */

/**
 * Warning message displayed to the user when the Gemini API key is not configured.
 * This message informs the user that AI-powered features (like event proposal generation)
 * will be unavailable until a valid API key is provided and selected.
 */
export const API_KEY_WARNING = "API_KEY environment variable is not set. Please set it to use Gemini AI features.";