import React, { useState, useCallback } from 'react';
import { Event } from '../types';
import EventCard from './EventCard';
import Calendar from './Calendar';
import Modal from './Modal';
import EventDetails from './EventDetails';
import LoadingSpinner from './LoadingSpinner';

interface ParticipantDashboardProps {
  events: Event[];
  onRegisterEvent: (eventId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({ events, onRegisterEvent, loading, error }) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);

  const handleViewDetails = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleRegister = useCallback(
    async (eventId: string) => {
      setRegisteringEventId(eventId);
      try {
        await onRegisterEvent(eventId);
        alert('Successfully registered for the event!');
        handleCloseDetailsModal(); // Close modal after successful registration
      } catch (err: any) {
        console.error('Error registering for event:', err);
        alert(`Registration failed: ${err.message || 'An unknown error occurred.'}`);
      } finally {
        setRegisteringEventId(null);
      }
    },
    [onRegisterEvent, handleCloseDetailsModal]
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-800">Available Events</h1>
        <p className="text-gray-600 mt-2">Browse and register for exciting campus events!</p>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <Calendar
        events={events}
        onRegisterEvent={handleRegister}
        isParticipantView={true}
        registeringEventId={registeringEventId}
      />

      {/* Optionally, list all events here as well if calendar is just one view */}
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

      <Modal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} title="Event Details">
        {selectedEvent ? (
          <EventDetails
            event={selectedEvent}
            onClose={handleCloseDetailsModal}
            onRegister={handleRegister}
            isParticipantView={true}
            registering={registeringEventId === selectedEvent.id}
          />
        ) : (
          <LoadingSpinner />
        )}
      </Modal>
    </div>
  );
};

export default ParticipantDashboard;
