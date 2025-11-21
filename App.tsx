import React, { useState, useEffect, useCallback } from 'react';
import OrganizerDashboard from './components/OrganizerDashboard';
import ParticipantDashboard from './components/ParticipantDashboard';
import { Event, NewEvent } from './types';
import { apiService } from './services/apiService';
import LoadingSpinner from './components/LoadingSpinner';
import Button from './components/Button';

/**
 * @file App.tsx
 * @brief The main application component for UniVerse, managing global state and views.
 *
 * This component acts as the root of the application, handling the overall layout,
 * navigation between organizer and participant views, fetching and managing event data,
 * and integrating with the AI Studio API key selection mechanism.
 */

// Declare the AIStudio interface globally to ensure type compatibility if it's implicitly
// defined elsewhere, and then extend `window` with this type.
// This resolves the "Subsequent property declarations must have the same type" error.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

/**
 * `App` is the root functional React component for the UniVerse application.
 * It manages the main application state, including the current view (organizer/participant),
 * the list of events, loading/error states, and API key selection for AI features.
 *
 * @returns {React.FC} The main application component.
 */
const App: React.FC = () => {
  // State to control the currently active view: 'organizer' or 'participant'.
  const [view, setView] = useState<'organizer' | 'participant'>('participant');
  // State to store the array of all events fetched from the API service.
  const [events, setEvents] = useState<Event[]>([]);
  // State to indicate if data is currently being loaded (e.g., initial event fetch).
  const [loading, setLoading] = useState(true);
  // State to store any error messages that occur during API calls or data fetching.
  const [error, setError] = useState<string | null>(null);
  // State to track whether a Gemini API key has been selected/configured.
  const [apiKeySelected, setApiKeySelected] = useState(false);

  /**
   * Fetches all events from the `apiService`.
   * Sets loading states and handles potential errors during the fetch operation.
   * This callback is memoized to prevent unnecessary re-creations.
   */
  const fetchEvents = useCallback(async () => {
    setLoading(true); // Start loading indicator.
    setError(null);    // Clear any previous errors.
    try {
      const fetchedEvents = await apiService.fetchEvents(); // Call the API service to get events.
      setEvents(fetchedEvents); // Update the events state.
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.message || 'Failed to load events.'); // Set error message.
    } finally {
      setLoading(false); // End loading indicator.
    }
  }, []); // Empty dependency array means this function is created once on mount.

  /**
   * Effect hook to perform initial setup:
   * 1. Check for Gemini API key availability (via `window.aistudio` or `process.env.API_KEY`).
   * 2. Fetch all events.
   * This runs only once when the component mounts.
   */
  useEffect(() => {
    /**
     * Checks if an API key has been selected/configured.
     * Prioritizes `window.aistudio` for AI Studio environment,
     * otherwise falls back to `process.env.API_KEY` for general environments.
     */
    const checkApiKey = async () => {
      // Check if `window.aistudio` and its `hasSelectedApiKey` function exist.
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      } else {
        // If `window.aistudio` is not present, assume the API key should be from `process.env.API_KEY`.
        // `!!` converts the value to a boolean.
        setApiKeySelected(!!process.env.API_KEY);
      }
    };

    checkApiKey();   // Execute API key check.
    fetchEvents();   // Execute initial event fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this effect runs only once on component mount.

  /**
   * Handles the creation of a new event.
   * Calls the `apiService` to create the event and updates the local state.
   * Handles errors during creation and re-throws them for specific form error handling.
   * This callback is memoized.
   * @param {NewEvent} newEvent The data for the new event.
   * @returns {Promise<Event>} A promise that resolves with the newly created Event object.
   * @throws {Error} Re-throws any error from `apiService.createEvent`.
   */
  const handleCreateEvent = useCallback(
    async (newEvent: NewEvent): Promise<Event> => {
      setError(null); // Clear any general errors.
      try {
        const createdEvent = await apiService.createEvent(newEvent); // Call API to create.
        // Optimistically update the UI by adding the new event to the state.
        setEvents((prev) => [...prev, createdEvent]);
        return createdEvent;
      } catch (err: any) {
        console.error('Error creating event:', err);
        // Set a general error message for the App component.
        setError(err.message || 'Failed to create event. Please check for clashes.');
        throw err; // Re-throw the error so `OrganizerDashboard` and `EventForm` can handle it.
      }
    },
    [] // Empty dependency array means this function is created once.
  );

  /**
   * Handles participant registration for an event.
   * Calls the `apiService` to register and updates the local event's participant count.
   * Handles errors during registration.
   * This callback is memoized.
   * @param {string} eventId The ID of the event to register for.
   * @returns {Promise<void>} A promise that resolves upon successful registration.
   * @throws {Error} Re-throws any error from `apiService.registerForEvent`.
   */
  const handleRegisterEvent = useCallback(
    async (eventId: string) => {
      setError(null); // Clear any general errors.
      try {
        await apiService.registerForEvent(eventId); // Call API to register.
        // Update the event's registered participants count in the local state.
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? { ...event, registeredParticipants: event.registeredParticipants + 1 }
              : event
          )
        );
      } catch (err: any) {
        console.error('Error registering for event:', err);
        setError(err.message || 'Failed to register for event.');
        throw err; // Re-throw the error for `ParticipantDashboard` and `EventDetails` to handle.
      }
    },
    [] // Empty dependency array means this function is created once.
  );

  /**
   * Handles the API key selection process, typically by opening an AI Studio dialog.
   * Sets `apiKeySelected` to true on success (assuming dialog always results in a selection).
   * This callback is memoized.
   */
  const handleSelectApiKey = useCallback(async () => {
    // Check if `window.aistudio` and its `openSelectKey` function exist.
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey(); // Open the API key selection dialog.
        setApiKeySelected(true); // Assume success after opening dialog (mitigates race condition).
        setError(null); // Clear any previous API key-related errors.
      } catch (err: any) {
        console.error('Error opening API key selection:', err);
        setError('Failed to open API key selection. Please try again.');
        // If the API call fails, assume key selection failed and potentially reset state or keep error.
        // For production, more robust error handling for "Requested entity not found" might be needed
        // to prompt re-selection.
        setApiKeySelected(false);
      }
    } else {
      // Fallback alert if AI Studio utility is not available.
      alert("API Key selection utility not available in this environment.");
      console.error("window.aistudio.openSelectKey is not a function or window.aistudio is undefined.");
      setError("API Key utility not found. Please ensure your environment is configured correctly.");
      setApiKeySelected(false);
    }
  }, []); // Empty dependency array means this function is created once.

  /**
   * Renders the content of the active dashboard (Organizer or Participant)
   * or a warning/prompt for API key selection if needed for the organizer view.
   * @returns {React.ReactNode} The content to be rendered in the main area.
   */
  const renderContent = () => {
    if (view === 'organizer') {
      // If in organizer view, check if API key is selected.
      if (!apiKeySelected) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto mt-10 text-center" role="alert" aria-live="polite">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Gemini API Key Required</h2>
            <p className="text-gray-700 mb-6">
              Organizer features, especially AI event proposal generation, require a configured Gemini API key.
              Please select your API key (from a paid GCP project) to proceed.
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Learn more about billing.
              </a>
            </p>
            <Button onClick={handleSelectApiKey} variant="primary" size="lg" aria-label="Select Gemini API Key">
              Select API Key
            </Button>
            {error && <p className="text-red-600 mt-4">{error}</p>}
          </div>
        );
      }
      // If API key is selected, render the Organizer Dashboard.
      return (
        <OrganizerDashboard
          events={events}
          onCreateEvent={handleCreateEvent}
          loading={loading}
          error={error}
        />
      );
    } else {
      // Always render the Participant Dashboard regardless of API key status (AI features are not critical here).
      return (
        <ParticipantDashboard
          events={events}
          onRegisterEvent={handleRegisterEvent}
          loading={loading}
          error={error}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Application header with title and view selection buttons. */}
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">UniVerse</h1>
        <nav className="flex gap-4" aria-label="Main navigation">
          <Button
            onClick={() => setView('organizer')}
            variant={view === 'organizer' ? 'primary' : 'secondary'}
            size="md"
            aria-controls="main-content"
            aria-selected={view === 'organizer'}
            role="tab"
          >
            Organizer
          </Button>
          <Button
            onClick={() => setView('participant')}
            variant={view === 'participant' ? 'primary' : 'secondary'}
            size="md"
            aria-controls="main-content"
            aria-selected={view === 'participant'}
            role="tab"
          >
            Participant
          </Button>
        </nav>
      </header>
      {/* Main content area where dashboards are rendered. */}
      <main id="main-content" className="flex-grow py-8" role="tabpanel">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;