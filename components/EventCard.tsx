import React from 'react';
import { Event } from '../types';
import Button from './Button';

/**
 * @file components/EventCard.tsx
 * @brief Displays a condensed view of an event, suitable for lists and calendar days.
 *
 * This component provides a clickable card interface for events, showing essential details
 * and offering actions like registration or viewing more details, depending on the context.
 */

/**
 * Props for the `EventCard` component.
 */
interface EventCardProps {
  event: Event; // The event data to display in the card.
  onRegister?: (eventId: string) => void; // Optional callback for registering for an event.
  onViewDetails?: (event: Event) => void; // Optional callback for viewing full event details.
  isParticipantView?: boolean; // If true, shows a "Register" button; otherwise, shows "View Details".
  registering?: boolean; // If true, indicates the event is currently being registered for (shows loading state).
}

/**
 * `EventCard` is a functional React component that renders a card displaying key information about an event.
 * It's interactive, allowing users to view details or register for the event.
 *
 * @param {EventCardProps} props The properties passed to the component.
 * @returns {React.FC<EventCardProps>} The event card component.
 */
const EventCard: React.FC<EventCardProps> = ({
  event, // The event object containing all data to be displayed.
  onRegister, // Callback for when the register button is clicked.
  onViewDetails, // Callback for when the card itself or a 'View Details' button is clicked.
  isParticipantView = false, // Flag to adjust UI for participant-specific actions.
  registering = false, // Flag to show a loading state on the register button.
}) => {
  /**
   * Handles the click event for the 'Register' button.
   * Prevents event propagation to avoid triggering the `onViewDetails` handler if both are present.
   * @param {React.MouseEvent} e The synthetic mouse event.
   */
  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to the card's onClick.
    onRegister?.(event.id); // Call the onRegister callback if provided.
  };

  /**
   * Handles the click event for the 'View Details' button or the card itself.
   * Prevents event propagation if triggered by a specific button.
   * @param {React.MouseEvent} e The synthetic mouse event.
   */
  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up.
    onViewDetails?.(event); // Call the onViewDetails callback if provided.
  };

  // Determine if the event is at full capacity.
  const isFull = event.registeredParticipants >= event.capacity;

  return (
    <div
      className="relative rounded-lg bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      // Attach onViewDetails to the entire card if provided, enabling click to view details.
      onClick={onViewDetails ? handleViewDetailsClick : undefined}
      role="listitem" // ARIA role to indicate this is an item in a list of events.
      aria-label={`Event: ${event.name}`} // Accessible label for the event card.
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
        {/* Display 'Full' status if capacity is reached. */}
        {isFull && <span className="ml-2 text-red-600 font-semibold"> (Full)</span>}
      </p>

      {/* Conditionally render buttons based on `isParticipantView` and `onViewDetails` props. */}
      {isParticipantView && (
        <div className="mt-4">
          <Button
            onClick={handleRegisterClick}
            disabled={isFull || registering} // Disable if full or currently registering.
            loading={registering} // Show loading spinner if registering.
            variant="primary"
            size="sm"
            className="w-full md:w-auto"
            aria-label={isFull ? `Event ${event.name} is full` : `Register for ${event.name}`}
          >
            {isFull ? 'Full' : 'Register'}
          </Button>
        </div>
      )}
      {/* If not participant view and onViewDetails is available, show a generic 'View Details' button. */}
      {!isParticipantView && onViewDetails && (
        <div className="mt-4">
          <Button
            onClick={handleViewDetailsClick}
            variant="secondary"
            size="sm"
            className="w-full md:w-auto"
            aria-label={`View details for ${event.name}`}
          >
            View Details
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventCard;