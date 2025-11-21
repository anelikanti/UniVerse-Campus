import React, { useState, useCallback, useEffect } from 'react';
import { NewEvent, Event } from '../types';
import Input from './Input';
import Button from './Button';
import { geminiService } from '../services/geminiService';
import Markdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

interface EventFormProps {
  onSubmit: (newEvent: NewEvent) => Promise<Event>;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  initialData?: NewEvent;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, onCancel, loading, error, initialData }) => {
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [proposalDetails, setProposalDetails] = useState('');

  // Validate form data
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Event name is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.date) errors.date = 'Date is required.';
    if (!formData.startTime) errors.startTime = 'Start time is required.';
    if (!formData.endTime) errors.endTime = 'End time is required.';
    if (!formData.location.trim()) errors.location = 'Location is required.';
    if (formData.capacity <= 0) errors.capacity = 'Capacity must be a positive number.';
    if (!formData.organizer.trim()) errors.organizer = 'Organizer name is required.';

    // Date/time specific validation
    if (formData.date && formData.startTime && formData.endTime) {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);
      if (startDateTime >= endDateTime) {
        errors.endTime = 'End time must be after start time.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  useEffect(() => {
    // Re-validate when form data changes
    validateForm();
  }, [formData, validateForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: id === 'capacity' ? parseInt(value, 10) || 0 : value }));
  };

  const handleGenerateProposal = useCallback(async () => {
    setGeneratingProposal(true);
    setProposalDetails('');
    try {
      const initialInfo = `Event Name: ${formData.name || '[No Name]'}\n` +
                          `Date: ${formData.date || '[No Date]'}\n` +
                          `Time: ${formData.startTime || '[No Start Time]'} - ${formData.endTime || '[No End Time]'}\n` +
                          `Location: ${formData.location || '[No Location]'}\n` +
                          `Organizer: ${formData.organizer || '[No Organizer]'}\n` +
                          `Brief idea: ${formData.description.substring(0, 200) || '[No brief idea]'}`; // Limit for initial prompt
      const proposal = await geminiService.generateEventProposal(initialInfo);
      setProposalDetails(proposal);
      setFormData((prev) => ({ ...prev, description: proposal }));
    } catch (err: any) {
      setFormErrors((prev) => ({ ...prev, description: `Failed to generate proposal: ${err.message}` }));
    } finally {
      setGeneratingProposal(false);
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit(formData);
        // Clear form after successful submission if needed, or rely on parent to close modal
        // setFormData({
        //   name: '', description: '', date: '', startTime: '', endTime: '',
        //   location: '', capacity: 0, organizer: ''
        // });
        // setFormErrors({});
      } catch (submitError: any) {
        // The parent component (OrganizerDashboard) already catches and sets an error prop.
        // We only need to re-throw the error to ensure it's propagated.
        console.error("Submission failed:", submitError);
        throw submitError; // Re-throw to allow parent to handle the error prop
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <Input
        id="name"
        label="Event Name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        error={formErrors.name}
        required
      />
      <Input
        id="organizer"
        label="Organizer Name"
        type="text"
        value={formData.organizer}
        onChange={handleChange}
        error={formErrors.organizer}
        required
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
        />
        <Input
          id="endTime"
          label="End Time"
          type="time"
          value={formData.endTime}
          onChange={handleChange}
          error={formErrors.endTime}
          required
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
      />
      {/* Removed formErrors.general as 'error' prop from parent handles submission errors */}
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-3">
        <Button
          type="button"
          onClick={handleGenerateProposal}
          loading={generatingProposal}
          disabled={!formData.name.trim() || !formData.description.trim()}
          variant="secondary"
          className="flex-shrink-0 w-full sm:w-auto"
        >
          {generatingProposal ? 'Generating...' : 'Generate Proposal with AI'}
        </Button>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading} variant="primary">
            Create Event
          </Button>
        </div>
      </div>

      {proposalDetails && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md shadow-inner">
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