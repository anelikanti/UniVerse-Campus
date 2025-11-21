import React, { useState, useCallback } from 'react';
import { Event, NewEvent } from '../types';
import Calendar from './Calendar';
import EventForm from './EventForm';
import Modal from './Modal';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

/**
 * @file components/OrganizerDashboard.tsx
 * @brief Dashboard component for event organizers to create and manage events.
 *
 * This component provides the interface for organizers, including a button to
 * create new events (via a modal form) and a calendar view to see all scheduled events.
 * It handles the submission of new event data and displays loading/error states.
 */

/**
 * Props for the `OrganizerDashboard` component.
 */
interface OrganizerDashboardProps {
  events: Event[]; // Array of all events currently managed by the organizer.
  onCreateEvent: (newEvent: NewEvent) => Promise<Event>; // Callback to create a new event via API.
  loading: boolean; // Indicates if initial event data is being loaded.
  error: string | null; // General error message related to event fetching or creation.
}

/**
 * `OrganizerDashboard` is a functional React component that serves as the main interface
 * for event organizers. It displays a calendar of events and allows for the creation of new events.
 *
 * @param {OrganizerDashboardProps} props The properties passed to the component.
 * @returns {React.FC<OrganizerDashboardProps>} The organizer dashboard component.
 */
const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ events, onCreateEvent, loading, error }) => {
  // State to control the visibility of the "Create New Event" form modal.
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  // State to store and display any submission-specific errors from the EventForm.
  const [formSubmissionError, setFormSubmissionError] = useState<string | null>(null);
  // State to indicate if the event creation form is currently submitting data.
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Callback to open the event creation form modal.
   * Also clears any previous submission errors.
   * Memoized to optimize performance.
   */
  const handleOpenForm = useCallback(() => {
    setIsFormModalOpen(true);
    setFormSubmissionError(null); // Clear errors from previous attempts.
  }, []);

  /**
   * Callback to close the event creation form modal.
   * Also clears any submission errors.
   * Memoized to optimize performance.
   */
  const handleCloseForm = useCallback(() => {
    setIsFormModalOpen(false);
    setFormSubmissionError(null); // Clear errors when modal is closed.
  }, []);

  /**
   * Handles the submission of a new event from the `EventForm`.
   * Sets submission loading state, calls the `onCreateEvent` prop, and handles success or failure.
   * Memoized to optimize performance.
   * @param {NewEvent} newEvent The new event data from the form.
   * @returns {Promise<Event>} A promise that resolves with the created event.
   * @throws {Error} Re-throws any error from `onCreateEvent` for upstream handling.
   */
  const handleCreateEvent = useCallback(
    async (newEvent: NewEvent): Promise<Event> => {
      setIsSubmitting(true); // Set submitting state to true.
      setFormSubmissionError(null); // Clear previous submission errors.
      try {
        const createdEvent = await onCreateEvent(newEvent); // Call the parent's onCreateEvent.
        console.log('Event created successfully:', createdEvent);
        handleCloseForm(); // Close the modal on successful event creation.
        return createdEvent; // Return the created event.
      } catch (err: any) {
        console.error('Error creating event:', err);
        // Set a user-friendly error message for the form.
        setFormSubmissionError(err.message || 'Failed to create event. Please try again.');
        throw err; // Re-throw the error to `EventForm` for its own error display logic.
      } finally {
        setIsSubmitting(false); // Reset submitting state.
      }
    },
    [onCreateEvent, handleCloseForm] // Dependencies for `handleCreateEvent`.
  );

  return (
    <div className="container mx-auto p-4 md:p-8" aria-label="Organizer Dashboard">
      {/* Header section with dashboard title and "Create New Event" button. */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Organizer Dashboard</h1>
        <Button onClick={handleOpenForm} variant="primary" size="lg" aria-label="Create new event">
          Create New Event
        </Button>
      </div>

      {/* Display loading spinner or general error messages. */}
      {loading && <LoadingSpinner />}
      {error && <p className="text-red-600 text-center mb-4" aria-live="assertive">{error}</p>}

      {/* Calendar component displaying all events. */}
      <Calendar events={events} />

      {/* Modal for the event creation form. */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseForm} title="Create New Event">
        <EventForm
          onSubmit={handleCreateEvent} // Pass the handler for form submission.
          onCancel={handleCloseForm} // Pass the handler for form cancellation.
          loading={isSubmitting} // Indicate if the form is currently submitting.
          error={formSubmissionError} // Pass specific submission errors to the form.
        />
      </Modal>
    </div>
  );
};

export default OrganizerDashboard;