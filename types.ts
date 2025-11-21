export interface Event {
  id: string;
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  capacity: number;
  registeredParticipants: number;
  organizer: string;
}

export type NewEvent = Omit<Event, 'id' | 'registeredParticipants'>;

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}
