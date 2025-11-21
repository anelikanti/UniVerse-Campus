import React, { useState, useEffect, useCallback } from 'react';
import OrganizerDashboard from './components/OrganizerDashboard';
import ParticipantDashboard from './components/ParticipantDashboard';
import { Event, NewEvent } from './types';
import { apiService } from './services/apiService';
import LoadingSpinner from './components/LoadingSpinner';
import Button from './components/Button';

// Define `window.aistudio` for API key management, if not globally defined
// The 'aistudio' object is assumed to be pre-configured and globally available in the execution context.
// Removing this declaration to avoid conflicts with existing global declarations.
// declare global {
//   interface Window {
//     aistudio: {
//       hasSelectedApiKey: () => Promise<boolean>;
//       openSelectKey: () => Promise<void>;
//     };
//   }
// }

const App: React.FC = () => {
  const [view, setView] = useState<'organizer' | 'participant'>('participant');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEvents = await apiService.fetchEvents();
      setEvents(fetchedEvents);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for API key presence if window.aistudio is available
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      } else {
        // Assume key is available via process.env.API_KEY if window.aistudio is not present
        setApiKeySelected(!!process.env.API_KEY);
      }
    };
    checkApiKey();
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch events once on mount and check API key

  const handleCreateEvent = useCallback(
    async (newEvent: NewEvent): Promise<Event> => {
      setError(null);
      try {
        const createdEvent = await apiService.createEvent(newEvent);
        // Optimistically update UI or refetch for exact state
        setEvents((prev) => [...prev, createdEvent]);
        return createdEvent;
      } catch (err: any) {
        console.error('Error creating event:', err);
        setError(err.message || 'Failed to create event. Please check for clashes.');
        throw err; // Re-throw to allow component to handle specific form errors
      }
    },
    []
  );

  const handleRegisterEvent = useCallback(
    async (eventId: string) => {
      setError(null);
      try {
        await apiService.registerForEvent(eventId);
        // Update the event's registered count locally
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
        throw err; // Re-throw for component to handle
      }
    },
    []
  );

  const handleSelectApiKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        setApiKeySelected(true); // Assume success after opening dialog
        setError(null); // Clear any previous API key errors
      } catch (err: any) {
        console.error('Error opening API key selection:', err);
        setError('Failed to open API key selection. Please try again.');
      }
    } else {
      alert("API Key selection utility not available in this environment.");
      console.error("window.aistudio.openSelectKey is not a function.");
      setError("API Key utility not found. Please ensure your environment is configured correctly.");
    }
  }, []);

  const renderContent = () => {
    if (view === 'organizer') {
      if (!apiKeySelected) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto mt-10 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Gemini API Key Required</h2>
            <p className="text-gray-700 mb-6">
              Organizer features, especially AI proposal generation, require a configured Gemini API key.
              Please select your API key (from a paid GCP project) to proceed.
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Learn more about billing.
              </a>
            </p>
            <Button onClick={handleSelectApiKey} variant="primary" size="lg">
              Select API Key
            </Button>
            {error && <p className="text-red-600 mt-4">{error}</p>}
          </div>
        );
      }
      return (
        <OrganizerDashboard
          events={events}
          onCreateEvent={handleCreateEvent}
          loading={loading}
          error={error}
        />
      );
    } else {
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
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">UniVerse</h1>
        <nav className="flex gap-4">
          <Button
            onClick={() => setView('organizer')}
            variant={view === 'organizer' ? 'primary' : 'secondary'}
            size="md"
          >
            Organizer
          </Button>
          <Button
            onClick={() => setView('participant')}
            variant={view === 'participant' ? 'primary' : 'secondary'}
            size="md"
          >
            Participant
          </Button>
        </nav>
      </header>
      <main className="flex-grow py-8">{renderContent()}</main>
    </div>
  );
};

export default App;