import { Event, NewEvent } from '../types';

/**
 * @file services/apiService.ts
 * @brief Provides a client-side API for managing event data with `localStorage` persistence.
 *
 * This service simulates asynchronous API calls and handles the CRUD operations
 * for events, including validation, clash detection, and data persistence
 * using the browser's `localStorage` for a seamless user experience across sessions.
 */

/**
 * The key used to store and retrieve event data in the browser's `localStorage`.
 * This ensures consistent access to the stored events.
 */
const LOCAL_STORAGE_KEY = 'universe_events';

/**
 * Generates a short, unique alphanumeric ID for new events.
 * This method uses a simple approach based on random string generation.
 * @returns {string} A unique string ID.
 */
const generateId = (): string => Math.random().toString(36).substring(2, 9);

/**
 * Simulates a network delay to mimic asynchronous API calls and provide
 * a more realistic user experience for loading states.
 * @param {number} ms The delay duration in milliseconds. Defaults to 500ms.
 * @returns {Promise<void>} A Promise that resolves after the specified delay.
 */
const simulateDelay = (ms: number = 500): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Combines a date string (YYYY-MM-DD) and a time string (HH:MM) into a single JavaScript Date object.
 * This is crucial for accurate temporal comparisons, such as checking for event overlaps.
 * @param {string} date The date string in 'YYYY-MM-DD' format.
 * @param {string} time The time string in 'HH:MM' (24-hour) format.
 * @returns {Date} A Date object representing the combined date and time.
 */
const getDateTime = (date: string, time: string): Date => {
  return new Date(`${date}T${time}:00`);
};

/**
 * Loads the array of events from `localStorage`.
 * If no data is found under `LOCAL_STORAGE_KEY` or if parsing fails,
 * an empty array is returned to ensure the application starts with a clean state.
 * @returns {Event[]} An array of Event objects retrieved from `localStorage`.
 */
const loadEventsFromLocalStorage = (): Event[] => {
  try {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    // Attempt to parse the stored JSON string back into an array of Event objects.
    return storedEvents ? JSON.parse(storedEvents) : [];
  } catch (error) {
    // Log any errors that occur during loading (e.g., malformed JSON).
    console.error("Failed to load events from localStorage:", error);
    // Return an empty array to prevent application crashes.
    return [];
  }
};

/**
 * Saves the current array of events to `localStorage`.
 * The array is first serialized into a JSON string before being stored.
 * This ensures data persistence across browser sessions.
 * @param {Event[]} currentEvents The array of events to be saved.
 */
const saveEventsToLocalStorage = (currentEvents: Event[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentEvents));
  } catch (error) {
    // Log any errors that occur during saving.
    console.error("Failed to save events to localStorage:", error);
  }
};

/**
 * The primary in-memory store for all events.
 * This array is initially populated from `localStorage` upon application startup
 * and is kept in sync with `localStorage` after any modifications.
 */
let events: Event[] = loadEventsFromLocalStorage();

/**
 * An object providing an interface to interact with event data.
 * It encapsulates the logic for event creation, retrieval, registration, and updates,
 * abstracting away the underlying `localStorage` persistence mechanism.
 */
export const apiService = {
  /**
   * Asynchronously fetches all stored events.
   * Simulates a brief network delay to provide a more realistic loading experience.
   * @returns {Promise<Event[]>} A promise that resolves with an array of all available Event objects.
   */
  fetchEvents: async (): Promise<Event[]> => {
    await simulateDelay();
    // Return a shallow copy of the events array to prevent direct external mutation
    // of the internal state, promoting immutability.
    return [...events];
  },

  /**
   * Asynchronously fetches a single event by its unique identifier.
   * Simulates a brief network delay.
   * @param {string} id The unique ID of the event to fetch.
   * @returns {Promise<Event | undefined>} A promise that resolves with the Event object if found, otherwise `undefined`.
   */
  getEventDetails: async (id: string): Promise<Event | undefined> => {
    await simulateDelay();
    // Use `find` to locate the event by its ID.
    return events.find(event => event.id === id);
  },

  /**
   * Asynchronously creates a new event.
   * This function includes robust validation for event times and performs
   * clash detection against existing events to prevent scheduling conflicts.
   * The new event is added to the in-memory store and persisted to `localStorage`.
   * @param {NewEvent} newEvent The data for the event to be created.
   * @returns {Promise<Event>} A promise that resolves with the newly created Event object.
   * @throws {Error} If event times are invalid (e.g., end time before start time) or if a time clash is detected with another event.
   */
  createEvent: async (newEvent: NewEvent): Promise<Event> => {
    await simulateDelay();

    // Convert string times to Date objects for accurate chronological comparison.
    const newEventStart = getDateTime(newEvent.date, newEvent.startTime);
    const newEventEnd = getDateTime(newEvent.date, newEvent.endTime);

    // Basic validation: Ensure the event's end time is strictly after its start time.
    if (newEventStart >= newEventEnd) {
      throw new Error("Event end time must be after start time.");
    }

    // Clash detection logic: Iterate through all existing events to check for overlaps.
    for (const existingEvent of events) {
      const existingEventStart = getDateTime(existingEvent.date, existingEvent.startTime);
      const existingEventEnd = getDateTime(existingEvent.date, existingEvent.endTime);

      // A clash occurs if the new event starts before the existing event ends,
      // AND the new event ends after the existing event starts.
      const overlap = (newEventStart < existingEventEnd && newEventEnd > existingEventStart);

      if (overlap) {
        // If an overlap is found, reject the creation with a descriptive error.
        throw new Error(`Clash detected: Event "${existingEvent.name}" (${existingEvent.date} ${existingEvent.startTime}-${existingEvent.endTime}) overlaps with the proposed time.`);
      }
    }

    // If all validations pass and no clashes are found, construct the final event object.
    const event: Event = {
      ...newEvent,
      id: generateId(), // Assign a unique ID using the helper function.
      registeredParticipants: 0, // Initialize participant count to zero for a new event.
    };
    events.push(event); // Add the new event to the in-memory array.
    saveEventsToLocalStorage(events); // Persist the updated events list to `localStorage`.
    return event;
  },

  /**
   * Asynchronously registers a participant for an existing event.
   * This function checks for event existence and capacity limits before allowing registration.
   * The registered participants count is updated, and the changes are persisted.
   * @param {string} id The ID of the event for which to register a participant.
   * @returns {Promise<void>} A promise that resolves upon successful registration.
   * @throws {Error} If the event is not found or if its maximum capacity has been reached.
   */
  registerForEvent: async (id: string): Promise<void> => {
    await simulateDelay();
    // Find the index of the event to be registered for.
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      // If the event is not found, throw an error.
      throw new Error('Event not found.');
    }
    const event = events[eventIndex]; // Get a reference to the event object.

    // Check if the event has reached its maximum capacity.
    if (event.registeredParticipants >= event.capacity) {
      throw new Error('Event is full.');
    }

    // Increment the registered participants count and create an updated event object.
    events[eventIndex] = { ...event, registeredParticipants: event.registeredParticipants + 1 };
    saveEventsToLocalStorage(events); // Persist the updated events list to `localStorage`.
  },

  /**
   * Asynchronously updates an existing event with partial data.
   * This allows modification of specific fields of an event without requiring all fields.
   * The updated event is merged into the in-memory store and changes are persisted.
   * @param {string} id The ID of the event to update.
   * @param {Partial<Event>} updates An object containing the fields and their new values to apply to the event.
   * @returns {Promise<Event>} A promise that resolves with the fully updated Event object.
   * @throws {Error} If the event with the specified ID is not found.
   */
  updateEvent: async (id: string, updates: Partial<Event>): Promise<Event> => {
    await simulateDelay();
    // Find the index of the event to be updated.
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      // If the event is not found, throw an error.
      throw new Error('Event not found.');
    }
    // Merge the existing event data with the provided updates.
    // This creates a new object to ensure React's state updates are detected.
    events[eventIndex] = { ...events[eventIndex], ...updates };
    saveEventsToLocalStorage(events); // Persist the updated events list to `localStorage`.
    return events[eventIndex];
  },
};