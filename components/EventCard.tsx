import React from 'react';
import { Event } from '../types';
import Button from './Button';

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  onViewDetails?: (event: Event) => void;
  isParticipantView?: boolean;
  registering?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onRegister,
  onViewDetails,
  isParticipantView = false,
  registering = false,
}) => {
  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegister?.(event.id);
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(event);
  };

  const isFull = event.registeredParticipants >= event.capacity;

  return (
    <div
      className="relative rounded-lg bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onViewDetails ? handleViewDetailsClick : undefined}
    >
      <h3 className="mb-2 text-xl font-semibold text-gray-800">{event.name}</h3>
      <p className="mb-1 text-sm text-gray-600">
        <span className="font-medium">Date:</span> {event.date}
      </p>
      <p className="mb-1 text-sm text-gray-600">
        <span className="font-medium">Time:</span> {event.startTime} - {event.endTime}
      </p>
      <p className="mb-1 text-sm text-gray-600">
        <span className="font-medium">Location:</span> {event.location}
      </p>
      <p className="mb-4 text-sm text-gray-600">
        <span className="font-medium">Participants:</span> {event.registeredParticipants} / {event.capacity}
        {isFull && <span className="ml-2 text-red-600 font-semibold"> (Full)</span>}
      </p>

      {isParticipantView && (
        <div className="mt-4">
          <Button
            onClick={handleRegisterClick}
            disabled={isFull || registering}
            loading={registering}
            variant="primary"
            size="sm"
            className="w-full md:w-auto"
          >
            {isFull ? 'Full' : 'Register'}
          </Button>
        </div>
      )}
      {!isParticipantView && onViewDetails && (
        <div className="mt-4">
          <Button
            onClick={handleViewDetailsClick}
            variant="secondary"
            size="sm"
            className="w-full md:w-auto"
          >
            View Details
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
