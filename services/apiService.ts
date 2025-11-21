import { Event, NewEvent } from '../types';

// Key for storing events in localStorage
const LOCAL_STORAGE_KEY = 'universe_events';

// Helper to generate unique IDs
const generateId = (): string => Math.random().toString(36).substring(2, 9);

// Helper to simulate API delay
const simulateDelay = (ms: number = 500): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Helper for date/time comparison
const getDateTime = (date: string, time: string): Date => {
  return new Date(`${date}T${time}:00`);
};

// --- localStorage persistence functions ---
const loadEventsFromLocalStorage = (): Event[] => {
  try {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedEvents ? JSON.parse(storedEvents) : [];
  } catch (error) {
    console.error("Failed to load events from localStorage:", error);
    return [];
  }
};

const saveEventsToLocalStorage = (currentEvents: Event[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentEvents));
  } catch (error) {
    console.error("Failed to save events to localStorage:", error);
  }
};
// --- End localStorage persistence functions ---


// In-memory store for events, initially loaded from localStorage
let events: Event[] = loadEventsFromLocalStorage();

export const apiService = {
  /**
   * Fetches all events.
   */
  fetchEvents: async (): Promise<Event[]> => {
    await simulateDelay();
    return [...events];
  },

  /**
   * Fetches a single event by ID.
   */
  getEventDetails: async (id: string): Promise<Event | undefined> => {
    await simulateDelay();
    return events.find(event => event.id === id);
  },

  /**
   * Creates a new event, including clash detection.
   */
  createEvent: async (newEvent: NewEvent): Promise<Event> => {
    await simulateDelay();

    const newEventStart = getDateTime(newEvent.date, newEvent.startTime);
    const newEventEnd = getDateTime(newEvent.date, newEvent.endTime);

    // Basic validation
    if (newEventStart >= newEventEnd) {
      throw new Error("Event end time must be after start time.");
    }

    // Clash detection
    for (const existingEvent of events) {
      const existingEventStart = getDateTime(existingEvent.date, existingEvent.startTime);
      const existingEventEnd = getDateTime(existingEvent.date, existingEvent.endTime);

      // Check for overlap
      const overlap = (newEventStart < existingEventEnd && newEventEnd > existingEventStart);

      if (overlap) {
        throw new Error(`Clash detected: Event "${existingEvent.name}" overlaps with the proposed time.`);
      }
    }

    const event: Event = {
      ...newEvent,
      id: generateId(),
      registeredParticipants: 0,
    };
    events.push(event);
    saveEventsToLocalStorage(events); // Persist changes
    return event;
  },

  /**
   * Registers a participant for an event.
   */
  registerForEvent: async (id: string): Promise<void> => {
    await simulateDelay();
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found.');
    }
    const event = events[eventIndex];
    if (event.registeredParticipants >= event.capacity) {
      throw new Error('Event is full.');
    }
    events[eventIndex] = { ...event, registeredParticipants: event.registeredParticipants + 1 };
    saveEventsToLocalStorage(events); // Persist changes
  },

  /**
   * Updates an existing event.
   */
  updateEvent: async (id: string, updates: Partial<Event>): Promise<Event> => {
    await simulateDelay();
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found.');
    }
    events[eventIndex] = { ...events[eventIndex], ...updates };
    saveEventsToLocalStorage(events); // Persist changes
    return events[eventIndex];
  },
};