/**
 * @file types.ts
 * @brief Defines the core data structures used throughout the UniVerse application.
 *
 * This file contains TypeScript interface definitions for events, new event creation data,
 * and calendar day representation, ensuring type safety and clarity across the project.
 */

/**
 * Represents an event in the system.
 * Contains all necessary details for display and management, including unique identifiers,
 * scheduling information, location, capacity, and participant count.
 */
export interface Event {
  id: string; // Unique identifier for the event, generated upon creation.
  name: string; // The official name or title of the event.
  description: string; // A detailed description, supporting Markdown for rich text.
  date: string; // The specific date of the event in 'YYYY-MM-DD' format.
  startTime: string; // The start time of the event in 'HH:MM' (24-hour) format.
  endTime: string; // The end time of the event in 'HH:MM' (24-hour) format.
  location: string; // The physical venue or virtual link where the event will take place.
  capacity: number; // The maximum number of participants the event can accommodate.
  registeredParticipants: number; // The current number of participants who have registered.
  organizer: string; // The name of the individual or organization hosting the event.
}

/**
 * Type for creating a new event.
 * This omits fields that are either auto-generated (`id`) or
 * initialized to a default value (`registeredParticipants`) when an event is first created.
 */
export type NewEvent = Omit<Event, 'id' | 'registeredParticipants'>;

/**
 * Represents a single day in the calendar view.
 * This interface is used to structure data for displaying the calendar grid,
 * indicating if a day is part of the current month, if it's today's date,
 * and listing any events scheduled for that day.
 */
export interface CalendarDay {
  date: Date; // The actual Date object for this calendar day, used for precise comparisons.
  isCurrentMonth: boolean; // A boolean indicating if this day falls within the currently displayed month.
  isToday: boolean; // A boolean indicating if this day is the current calendar date.
  events: Event[]; // An array of Event objects scheduled to occur on this specific day.
}