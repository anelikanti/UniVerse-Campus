import React from 'react';
import { Event } from '../types';
import Markdown from 'react-markdown';
import Button from './Button';

/**
 * @file components/EventDetails.tsx
 * @brief Displays a comprehensive view of a single event.
 *
 * This component presents all available details of an event, including its description
 * rendered with Markdown, and provides actions like closing the view or registering.
 */

/**
 * Props for the `EventDetails` component.
 */
interface EventDetailsProps {
  event: Event; // The event object containing all detailed information.
  onClose: () => void; // Callback function to close the details view.
  onRegister?: (eventId: string) => void; // Optional callback for registering for the event.
  isParticipantView?: boolean; // If true, shows the "Register for Event" button.
  registering?: boolean; // If true, indicates an ongoing registration process (shows loading state).
}

/**
 * `EventDetails` is a functional React component that renders the full details of a single event.
 * It uses `react-markdown` to display rich text descriptions and offers contextual actions.
 *
 * @param {EventDetailsProps} props The properties passed to the component.
 * @returns {React.FC<EventDetailsProps>} The event details component.
 */
const EventDetails: React.FC<EventDetailsProps> = ({
  event, // The event object whose details are to be displayed.
  onClose, // Function to call when the close button is clicked.
  onRegister, // Optional function to call when the register button is clicked.
  isParticipantView = false, // Flag to determine if the register button should be shown.
  registering = false, // Flag to indicate if registration is in progress.
}) => {
  /**
   * Handles the click event for the 'Register for Event' button.
   * Invokes the `onRegister` callback if it is provided.
   */
  const handleRegisterClick = () => {
    onRegister?.(event.id);
  };

  // Determine if the event is at full capacity.
  const isFull = event.registeredParticipants >= event.capacity;

  return (
    <div className="p-4" role="document" aria-label={`Details for ${event.name}`}>
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
        {/* Display 'Full' status if capacity is reached. */}
        {isFull && <span className="ml-2 text-red-600 font-semibold"> (Full)</span>}
      </p>
      <div className="prose max-w-none mb-6 text-gray-800" aria-label="Event description">
        {/* `react-markdown` component renders the event description, which can contain Markdown syntax. */}
        <Markdown>{event.description}</Markdown>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {/* Conditionally render the 'Register for Event' button if in participant view. */}
        {isParticipantView && (
          <Button
            onClick={handleRegisterClick}
            disabled={isFull || registering} // Disable if full or currently registering.
            loading={registering} // Show loading spinner if registering.
            variant="primary"
            aria-label={isFull ? `Event ${event.name} is full` : `Register for ${event.name}`}
          >
            {isFull ? 'Full' : 'Register for Event'}
          </Button>
        )}
        {/* Button to close the event details view. */}
        <Button onClick={onClose} variant="secondary" aria-label="Close event details">
          Close
        </Button>
      </div>
    </div>
  );
};

export default EventDetails;