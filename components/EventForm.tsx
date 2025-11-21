import React, { useState, useCallback, useEffect } from 'react';
import { NewEvent, Event } from '../types';
import Input from './Input';
import Button from './Button';
import { geminiService } from '../services/geminiService';
import Markdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

/**
 * @file components/EventForm.tsx
 * @brief Form component for creating new events, including AI-powered proposal generation.
 *
 * This form allows organizers to input event details and leverage the Gemini AI
 * to generate a detailed event description, streamlining the event creation process.
 * It includes client-side validation and submission handling.
 */

/**
 * Props for the `EventForm` component.
 */
interface EventFormProps {
  onSubmit: (newEvent: NewEvent) => Promise<Event>; // Callback to handle form submission (creating an event).
  onCancel: () => void; // Callback to handle form cancellation.
  loading: boolean; // Indicates if the form submission is in progress.
  error: string | null; // General error message from the parent component (e.g., API errors).
  initialData?: NewEvent; // Optional initial data to pre-populate the form (e.g., for editing).
}

/**
 * `EventForm` is a functional React component that provides a form for creating or editing events.
 * It features input fields for various event details, client-side validation,
 * and integration with the Gemini AI for generating event descriptions.
 *
 * @param {EventFormProps} props The properties passed to the component.
 * @returns {React.FC<EventFormProps>} The event creation/editing form component.
 */
const EventForm: React.FC<EventFormProps> = ({ onSubmit, onCancel, loading, error, initialData }) => {
  // State to manage form input data. Initializes with `initialData` if provided, otherwise empty.
  const [formData, setFormData] = useState<NewEvent>(
    initialData || {
      name: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      capacity: 0,
      organizer: '',
    }
  );
  // State to manage validation errors for individual form fields.
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // State to indicate if the AI proposal generation is in progress.
  const [generatingProposal, setGeneratingProposal] = useState(false);
  // State to store and display the AI-generated proposal before final submission.
  const [proposalDetails, setProposalDetails] = useState('');

  /**
   * Validates the current form data and updates the `formErrors` state.
   * This callback is memoized to prevent unnecessary re-creations.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    // Basic validation for required fields and positive capacity.
    if (!formData.name.trim()) errors.name = 'Event name is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.date) errors.date = 'Date is required.';
    if (!formData.startTime) errors.startTime = 'Start time is required.';
    if (!formData.endTime) errors.endTime = 'End time is required.';
    if (!formData.location.trim()) errors.location = 'Location is required.';
    if (formData.capacity <= 0) errors.capacity = 'Capacity must be a positive number.';
    if (!formData.organizer.trim()) errors.organizer = 'Organizer name is required.';

    // Date/time specific validation: Ensure end time is after start time.
    if (formData.date && formData.startTime && formData.endTime) {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);
      if (startDateTime >= endDateTime) {
        errors.endTime = 'End time must be after start time.';
      }
    }

    setFormErrors(errors); // Update the errors state.
    return Object.keys(errors).length === 0; // Return true if no errors.
  }, [formData]); // Dependency array: re-create if `formData` changes.

  // Effect hook to re-validate the form whenever `formData` changes.
  useEffect(() => {
    validateForm();
  }, [formData, validateForm]); // Dependency array: re-run if `formData` or `validateForm` changes.

  /**
   * Handles changes in form input fields.
   * Updates the `formData` state based on the input's ID and value.
   * Parses 'capacity' to an integer.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: id === 'capacity' ? parseInt(value, 10) || 0 : value }));
  };

  /**
   * Handles the AI-powered event proposal generation.
   * Sends initial event details to the `geminiService` and updates the description field
   * with the AI-generated proposal.
   */
  const handleGenerateProposal = useCallback(async () => {
    setGeneratingProposal(true); // Set loading state for AI generation.
    setProposalDetails(''); // Clear previous proposal.
    try {
      // Construct a brief initial info string to send to the AI.
      const initialInfo = `Event Name: ${formData.name || '[No Name]'}\n` +
                          `Date: ${formData.date || '[No Date]'}\n` +
                          `Time: ${formData.startTime || '[No Start Time]'} - ${formData.endTime || '[No End Time]'}\n` +
                          `Location: ${formData.location || '[No Location]'}\n` +
                          `Organizer: ${formData.organizer || '[No Organizer]'}\n` +
                          `Brief idea: ${formData.description.substring(0, 200) || '[No brief idea]'}`; // Limit for initial prompt
      // Call the Gemini service to get the AI-generated proposal.
      const proposal = await geminiService.generateEventProposal(initialInfo);
      setProposalDetails(proposal); // Display the proposal preview.
      setFormData((prev) => ({ ...prev, description: proposal })); // Update the form's description field.
    } catch (err: any) {
      // Handle errors during AI generation, setting a form-specific error.
      setFormErrors((prev) => ({ ...prev, description: `Failed to generate proposal: ${err.message}` }));
    } finally {
      setGeneratingProposal(false); // Reset loading state.
    }
  }, [formData]); // Dependency array: re-create if `formData` changes.

  /**
   * Handles the form submission.
   * Performs validation, calls the `onSubmit` prop, and handles success or propagation of errors.
   * @param {React.FormEvent} e The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission.
    if (validateForm()) { // If the form data is valid...
      try {
        await onSubmit(formData); // Call the parent's onSubmit function.
        // The parent component is responsible for closing the modal and clearing state.
      } catch (submitError: any) {
        // Log the error and re-throw it so the parent component can catch and display it.
        console.error("Submission failed:", submitError);
        throw submitError;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4" aria-label="Create new event form">
      {/* Input fields for event details */}
      <Input
        id="name"
        label="Event Name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        error={formErrors.name}
        required
        aria-required="true"
      />
      <Input
        id="organizer"
        label="Organizer Name"
        type="text"
        value={formData.organizer}
        onChange={handleChange}
        error={formErrors.organizer}
        required
        aria-required="true"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="date"
          label="Date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          error={formErrors.date}
          required
          aria-required="true"
        />
        <Input
          id="capacity"
          label="Capacity"
          type="number"
          value={formData.capacity.toString()}
          onChange={handleChange}
          error={formErrors.capacity}
          min="1"
          required
          aria-required="true"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="startTime"
          label="Start Time"
          type="time"
          value={formData.startTime}
          onChange={handleChange}
          error={formErrors.startTime}
          required
          aria-required="true"
        />
        <Input
          id="endTime"
          label="End Time"
          type="time"
          value={formData.endTime}
          onChange={handleChange}
          error={formErrors.endTime}
          required
          aria-required="true"
        />
      </div>
      <Input
        id="location"
        label="Location"
        type="text"
        value={formData.location}
        onChange={handleChange}
        error={formErrors.location}
        required
        aria-required="true"
      />
      <Input
        id="description"
        label="Description / Brief Idea"
        as="textarea"
        rows={5}
        value={formData.description}
        onChange={handleChange}
        error={formErrors.description}
        required
        aria-required="true"
      />
      {/* Display a general submission error from the parent component. */}
      {error && <p className="text-red-600 text-sm mt-2" aria-live="assertive">{error}</p>}

      {/* Action buttons: Generate Proposal, Cancel, Create Event */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-3">
        <Button
          type="button"
          onClick={handleGenerateProposal}
          loading={generatingProposal} // Show loading spinner during AI generation.
          // Disable button if essential fields for AI generation are empty.
          disabled={!formData.name.trim() || !formData.description.trim()}
          variant="secondary"
          className="flex-shrink-0 w-full sm:w-auto"
          aria-label={generatingProposal ? 'Generating event proposal with AI' : 'Generate event proposal with AI'}
        >
          {generatingProposal ? 'Generating...' : 'Generate Proposal with AI'}
        </Button>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading || Object.keys(formErrors).length > 0} variant="primary">
            Create Event
          </Button>
        </div>
      </div>

      {/* Display the AI-generated proposal preview if available. */}
      {proposalDetails && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md shadow-inner" aria-label="AI-Generated Proposal Preview">
          <h4 className="font-semibold text-blue-800 mb-2">AI-Generated Proposal Preview:</h4>
          <div className="prose max-w-none">
            <Markdown>{proposalDetails}</Markdown>
          </div>
        </div>
      )}
    </form>
  );
};

export default EventForm;