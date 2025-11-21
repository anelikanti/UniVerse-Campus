import React, { useState, useCallback } from 'react';
import { Event } from '../types';
import EventCard from './EventCard'; // Although commented out, it's good to keep the import if logic might be re-enabled.
import Calendar from './Calendar';
import Modal from './Modal';
import EventDetails from './EventDetails';
import LoadingSpinner from './LoadingSpinner';

/**
 * @file components/ParticipantDashboard.tsx
 * @brief Dashboard component for event participants to browse and register for events.
 *
 * This component provides the interface for participants, featuring a calendar view
 * of all available events and functionality to register for them and view details.
 * It handles registration logic and displays loading/error states.
 */

/**
 * Props for the `ParticipantDashboard` component.
 */
interface ParticipantDashboardProps {
  events: Event[]; // Array of all events available for participants.
  onRegisterEvent: (eventId: string) => Promise<void>; // Callback to register for an event via API.
  loading: boolean; // Indicates if initial event data is being loaded.
  error: string | null; // General error message related to event fetching or registration.
}

/**
 * `ParticipantDashboard` is a functional React component that serves as the main interface
 * for event participants. It allows users to browse events on a calendar, view detailed information,
 * and register for events.
 *
 * @param {ParticipantDashboardProps} props The properties passed to the component.
 * @returns {React.FC<ParticipantDashboardProps>} The participant dashboard component.
 */
const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({ events, onRegisterEvent, loading, error }) => {
  // State to control the visibility of the event details modal.
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  // State to store the event object whose details are currently being displayed.
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // State to store the ID of the event currently undergoing a registration process.
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);

  /**
   * Callback to handle viewing full details of an event.
   * Sets the `selectedEvent` and opens the `isDetailsModalOpen`.
   * Memoized to optimize performance.
   * @param {Event} event The event object to display details for.
   */
  const handleViewDetails = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  }, []);

  /**
   * Callback to close the event details modal.
   * Resets `selectedEvent` and closes the modal.
   * Memoized to optimize performance.
   */
  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  /**
   * Handles the registration process for an event.
   * Sets the `registeringEventId` to show a loading state, calls `onRegisterEvent`,
   * and handles success/failure with user alerts.
   * Memoized to optimize performance.
   * @param {string} eventId The ID of the event to register for.
   */
  const handleRegister = useCallback(
    async (eventId: string) => {
      setRegisteringEventId(eventId); // Set the event ID to indicate registration is in progress.
      try {
        await onRegisterEvent(eventId); // Call the parent's onRegisterEvent function.
        alert('Successfully registered for the event!'); // Inform user of success.
        handleCloseDetailsModal(); // Close the details modal after successful registration.
      } catch (err: any) {
        console.error('Error registering for event:', err);
        alert(`Registration failed: ${err.message || 'An unknown error occurred.'}`); // Inform user of failure.
      } finally {
        setRegisteringEventId(null); // Reset the registering event ID.
      }
    },
    [onRegisterEvent, handleCloseDetailsModal] // Dependencies for `handleRegister`.
  );

  return (
    <div className="container mx-auto p-4 md:p-8" aria-label="Participant Dashboard">
      {/* Header section for the participant dashboard. */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-800">Available Events</h1>
        <p className="text-gray-600 mt-2">Browse and register for exciting campus events!</p>
      </div>

      {/* Display loading spinner or general error messages. */}
      {loading && <LoadingSpinner />}
      {error && <p className="text-red-600 text-center mb-4" aria-live="assertive">{error}</p>}

      {/* Calendar component displaying events, configured for participant view. */}
      <Calendar
        events={events}
        onRegisterEvent={handleRegister} // Pass the registration handler.
        isParticipantView={true} // Enable participant-specific actions in the calendar.
        registeringEventId={registeringEventId} // Pass the ID of the event being registered.
      />

      {/* This commented out section shows how all events could optionally be listed below the calendar. */}
      {/* If re-enabled, ensure EventCard props like `onViewDetails` are passed correctly. */}
      {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
              onViewDetails={handleViewDetails}
              isParticipantView={true}
              registering={registeringEventId === event.id}
            />
          ))
        ) : (
          <p className="text-lg text-gray-600 col-span-full">No events currently available.</p>
        )}
      </div> */}

      {/* Modal for displaying detailed event information when an event card is clicked. */}
      <Modal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} title="Event Details">
        {selectedEvent ? (
          <EventDetails
            event={selectedEvent}
            onClose={handleCloseDetailsModal}
            onRegister={handleRegister} // Pass the registration handler to details view.
            isParticipantView={true}
            registering={registeringEventId === selectedEvent.id}
          />
        ) : (
          <LoadingSpinner /> // Show spinner while event details are loading (should be instantaneous with local state).
        )}
      </Modal>
    </div>
  );
};

export default ParticipantDashboard;