import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * @file index.tsx
 * @brief Entry point of the React application.
 *
 * This file is responsible for rendering the main `App` component into the DOM.
 * It sets up the React root and wraps the application in `React.StrictMode`
 * for development-time checks.
 */

/**
 * Finds the root element in the HTML document where the React app will be mounted.
 * @type {HTMLElement | null}
 */
const rootElement = document.getElementById('root');

// Validate that the root element exists before attempting to mount the application.
if (!rootElement) {
  // If the root element is not found, throw an error as the application cannot initialize.
  throw new Error("Could not find root element with ID 'root' to mount the React application.");
}

/**
 * Creates a React root, which enables concurrent features in React 18+.
 * This is the entry point for rendering React components into the DOM.
 * @type {ReactDOM.Root}
 */
const root = ReactDOM.createRoot(rootElement);

/**
 * Renders the main `App` component within `React.StrictMode`.
 *
 * `React.StrictMode` is a development-time tool that helps identify potential problems
 * in an application by activating additional checks and warnings for its descendants.
 * It does not render any visible UI.
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);