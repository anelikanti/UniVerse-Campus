import React from 'react';
import { Event } from '../types';
import Markdown from 'react-markdown';
import Button from './Button';

interface EventDetailsProps {
  event: Event;
  onClose: () => void;
  onRegister?: (eventId: string) => void;
  isParticipantView?: boolean;
  registering?: boolean;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  onClose,
  onRegister,
  isParticipantView = false,
  registering = false,
}) => {
  const handleRegisterClick = () => {
    onRegister?.(event.id);
  };

  const isFull = event.registeredParticipants >= event.capacity;

  return (
    <div className="p-4">
      <h2 className="mb-4 text-3xl font-bold text-gray-800">{event.name}</h2>
      <p className="mb-2 text-lg text-gray-700">
        <span className="font-semibold">Organizer:</span> {event.organizer}
      </p>
      <p className="mb-2 text-lg text-gray-700">
        <span className="font-semibold">Date:</span> {event.date}
      </p>
      <p className="mb-2 text-lg text-gray-700">
        <span className="font-semibold">Time:</span> {event.startTime} - {event.endTime}
      </p>
      <p className="mb-2 text-lg text-gray-700">
        <span className="font-semibold">Location:</span> {event.location}
      </p>
      <p className="mb-4 text-lg text-gray-700">
        <span className="font-semibold">Participants:</span> {event.registeredParticipants} / {event.capacity}
        {isFull && <span className="ml-2 text-red-600 font-semibold"> (Full)</span>}
      </p>
      <div className="prose max-w-none mb-6 text-gray-800">
        <Markdown>{event.description}</Markdown>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {isParticipantView && (
          <Button
            onClick={handleRegisterClick}
            disabled={isFull || registering}
            loading={registering}
            variant="primary"
          >
            {isFull ? 'Full' : 'Register for Event'}
          </Button>
        )}
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      </div>
    </div>
  );
};

export default EventDetails;
