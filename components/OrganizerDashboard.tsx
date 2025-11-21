import React, { useState, useCallback } from 'react';
import { Event, NewEvent } from '../types';
import Calendar from './Calendar';
import EventForm from './EventForm';
import Modal from './Modal';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface OrganizerDashboardProps {
  events: Event[];
  onCreateEvent: (newEvent: NewEvent) => Promise<Event>;
  loading: boolean;
  error: string | null;
}

const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ events, onCreateEvent, loading, error }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formSubmissionError, setFormSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = useCallback(() => {
    setIsFormModalOpen(true);
    setFormSubmissionError(null);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormModalOpen(false);
    setFormSubmissionError(null);
  }, []);

  const handleCreateEvent = useCallback(
    async (newEvent: NewEvent) => {
      setIsSubmitting(true);
      setFormSubmissionError(null);
      try {
        const createdEvent = await onCreateEvent(newEvent);
        console.log('Event created:', createdEvent);
        handleCloseForm(); // Close modal on success
        return createdEvent;
      } catch (err: any) {
        console.error('Error creating event:', err);
        setFormSubmissionError(err.message || 'Failed to create event. Please try again.');
        throw err; // Re-throw to propagate error to EventForm
      } finally {
        setIsSubmitting(false);
      }
    },
    [onCreateEvent, handleCloseForm]
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Organizer Dashboard</h1>
        <Button onClick={handleOpenForm} variant="primary" size="lg">
          Create New Event
        </Button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <Calendar events={events} />

      <Modal isOpen={isFormModalOpen} onClose={handleCloseForm} title="Create New Event">
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={handleCloseForm}
          loading={isSubmitting}
          error={formSubmissionError}
        />
      </Modal>
    </div>
  );
};

export default OrganizerDashboard;
