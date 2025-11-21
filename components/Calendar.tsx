import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, CalendarDay } from '../types';
import Button from './Button';
import EventCard from './EventCard';
import Modal from './Modal';
import EventDetails from './EventDetails';
import LoadingSpinner from './LoadingSpinner';

/**
 * @file components/Calendar.tsx
 * @brief Interactive calendar component for displaying and managing events.
 *
 * This component provides a monthly calendar view, allowing navigation between months,
 * highlighting today's date, displaying events on specific days, and offering
 * functionality to view event details or register for events.
 */

/**
 * Props for the `Calendar` component.
 */
interface CalendarProps {
  events: Event[]; // Array of all events to be displayed on the calendar.
  onRegisterEvent?: (eventId: string) => Promise<void>; // Optional callback for registering for an event.
  isParticipantView?: boolean; // If true, enables registration actions; otherwise, it's a view-only calendar for organizers.
  registeringEventId?: string | null; // ID of the event currently undergoing registration, to show loading state.
}

/**
 * `Calendar` is a functional React component that renders a monthly calendar grid.
 * It displays events, allows navigation, and provides interactive features for event management.
 *
 * @param {CalendarProps} props The properties passed to the component.
 * @returns {React.FC<CalendarProps>} The calendar component.
 */
const Calendar: React.FC<CalendarProps> = ({ events, onRegisterEvent, isParticipantView, registeringEventId }) => {
  // State to manage the currently displayed month and year in the calendar.
  const [currentDate, setCurrentDate] = useState(new Date());
  // State to hold events for the currently selected day in the calendar.
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);
  // State to control the visibility of the event details modal.
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  // State to store the event object whose details are currently being displayed in the modal.
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  /**
   * Calculates the number of days in a given month and year.
   * @param {number} year The full year (e.g., 2023).
   * @param {number} month The 0-indexed month (0 for January, 11 for December).
   * @returns {number} The number of days in the specified month.
   */
  const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

  /**
   * Calculates the day of the week for the first day of a given month.
   * @param {number} year The full year.
   * @param {number} month The 0-indexed month.
   * @returns {number} The day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday).
   */
  const firstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();

  /**
   * Navigates the calendar to the previous month.
   */
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  /**
   * Navigates the calendar to the next month.
   */
  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  /**
   * Resets the calendar view to the current day/month.
   */
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Extract current year and month from `currentDate` state for calculations.
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  /**
   * Memoized array of `CalendarDay` objects representing the current month's grid.
   * This calculation is optimized to only re-run when the `currentYear` or `currentMonth` changes.
   */
  const calendarDays: CalendarDay[] = useMemo(() => {
    const totalDaysInCurrentMonth = daysInMonth(currentYear, currentMonth);
    // Determine the starting day of the week for the first day of the month.
    // Adjust for Monday-first week display: if firstDay is Sunday (0), it effectively means 6 empty days before it.
    // Otherwise, it's (firstDay - 1) empty days.
    const firstDay = firstDayOfMonth(currentYear, currentMonth);
    const prevMonthDaysToShow = (firstDay === 0 ? 6 : firstDay - 1);
    
    const monthCalendarDays: CalendarDay[] = [];

    // Fill preceding empty days from the previous month to complete the first week.
    for (let i = 0; i < prevMonthDaysToShow; i++) {
      monthCalendarDays.push({
        date: new Date(currentYear, currentMonth, i - prevMonthDaysToShow + 1), // This calculates a day in the previous month.
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    // Fill days for the current month.
    for (let i = 1; i <= totalDaysInCurrentMonth; i++) {
      const dayDate = new Date(currentYear, currentMonth, i);
      const today = new Date();
      // Check if the current day in the loop is today's date.
      const isToday =
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();

      monthCalendarDays.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: isToday,
        events: [], // Events will be populated in the `useEffect` hook.
      });
    }
    
    // Fill trailing empty days from the next month to complete the last week (up to 6 rows).
    const totalCells = monthCalendarDays.length;
    const remainingCells = 42 - totalCells; // A typical calendar grid has 6 rows * 7 days = 42 cells.
    if (remainingCells > 0) {
      for (let i = 1; i <= remainingCells; i++) {
        monthCalendarDays.push({
          date: new Date(currentYear, currentMonth + 1, i), // These are days from the next month.
          isCurrentMonth: false,
          isToday: false,
          events: [],
        });
      }
    }

    return monthCalendarDays;
  }, [currentYear, currentMonth]); // Re-calculate only when year or month changes.

  /**
   * Effect hook to populate events into the `calendarDays` and set the initial `selectedDayEvents`.
   * This runs whenever `events` or `calendarDays` changes.
   */
  useEffect(() => {
    // Create a deep copy of calendarDays to ensure mutability for `day.events`.
    // This is important because `calendarDays` is memoized and should not be directly mutated.
    const updatedCalendarDays = calendarDays.map(day => ({ ...day, events: [] }));
    
    // Iterate through all fetched events and assign them to the correct day in the calendar.
    events.forEach((event) => {
      const eventDate = new Date(event.date);
      // Find the corresponding calendar day for the event.
      const targetDay = updatedCalendarDays.find((day) =>
        day.date.getDate() === eventDate.getDate() &&
        day.date.getMonth() === eventDate.getMonth() &&
        day.date.getFullYear() === eventDate.getFullYear()
      );
      if (targetDay) {
        targetDay.events.push(event); // Add the event to the day's events array.
      }
    });

    // Sort events within each day by their start time for consistent display.
    updatedCalendarDays.forEach(day => {
      day.events.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    const today = new Date();
    // Automatically select events for today if it falls within the current month.
    const currentDayEvents = updatedCalendarDays.find(
      (day) =>
        day.isCurrentMonth &&
        day.date.getDate() === today.getDate() &&
        day.date.getMonth() === today.getMonth() &&
        day.date.getFullYear() === today.getFullYear()
    )?.events || [];

    if (currentDayEvents.length > 0) {
      setSelectedDayEvents(currentDayEvents);
    } else {
      // If today has no events or is not in the current month,
      // select events for the first day of the current month that actually has events,
      // or an empty array if no days in the current month have events.
      setSelectedDayEvents(updatedCalendarDays.filter(day => day.isCurrentMonth)[0]?.events || []);
    }
  }, [events, calendarDays]); // eslint-disable-line react-hooks/exhaustive-deps - Disabling for simplicity, but in a real app, careful dependency management is key.

  /**
   * Handles a click on a calendar day.
   * Updates `selectedDayEvents` to display events for the clicked day.
   * @param {CalendarDay} day The `CalendarDay` object that was clicked.
   */
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDayEvents(day.events);
  };

  /**
   * Callback to handle viewing full details of an event.
   * Sets the `selectedEvent` and opens the `isDetailsModalOpen`.
   * Memoized to optimize performance.
   * @param {Event} event The event object to display details for.
   */
  const handleViewDetails = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  }, []);

  /**
   * Callback to close the event details modal.
   * Resets `selectedEvent` and closes the modal.
   * Memoized to optimize performance.
   */
  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  /**
   * Callback to handle event registration.
   * If `onRegisterEvent` is provided, it calls it and handles success/failure.
   * Memoized to optimize performance.
   * @param {string} eventId The ID of the event to register for.
   */
  const handleRegister = useCallback(
    async (eventId: string) => {
      if (onRegisterEvent) {
        try {
          await onRegisterEvent(eventId);
          // Alert user on successful registration.
          alert('Successfully registered for the event!');
          // A real app might refetch events or update local state more elegantly.
        } catch (error) {
          // Display an alert for registration failure.
          console.error("Failed to register for event:", error);
          alert(`Registration failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    },
    [onRegisterEvent] // Dependency array for `handleRegister`.
  );

  // Array of day names for the calendar header, starting with Monday.
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-xl" aria-label="Event Calendar">
      {/* Calendar header with month/year display and navigation buttons. */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800" aria-live="polite">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentYear}
        </h2>
        <div className="flex gap-2" role="group" aria-label="Calendar navigation">
          <Button onClick={goToPreviousMonth} variant="secondary" size="sm" aria-label="Go to previous month">
            Prev
          </Button>
          <Button onClick={goToToday} variant="secondary" size="sm" aria-label="Go to today's date">
            Today
          </Button>
          <Button onClick={goToNextMonth} variant="secondary" size="sm" aria-label="Go to next month">
            Next
          </Button>
        </div>
      </div>

      {/* Days of the week header for the calendar grid. */}
      <div className="grid grid-cols-7 text-center font-semibold text-gray-700 mb-2" role="rowgroup">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-2" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid displaying days and event counts. */}
      <div className="grid grid-cols-7 gap-1 md:gap-2" role="grid">
        {calendarDays.map((day, index) => {
          // Determine if this calendar day is the currently selected day to highlight it.
          const isSelectedDay = selectedDayEvents.length > 0 && day.isCurrentMonth && (() => {
            const firstSelectedEventDate = new Date(selectedDayEvents[0].date);
            return (
              firstSelectedEventDate.getDate() === day.date.getDate() &&
              firstSelectedEventDate.getMonth() === day.date.getMonth() &&
              firstSelectedEventDate.getFullYear() === day.date.getFullYear()
            );
          })();

          return (
            <div
              key={index}
              className={`relative p-2 rounded-md h-20 sm:h-24 flex flex-col justify-between items-center text-center transition-colors duration-150
              ${day.isCurrentMonth ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              ${day.isToday ? 'border-2 border-blue-500 bg-blue-100 hover:bg-blue-200' : ''}
              ${day.events.length > 0 && !day.isToday ? 'border-2 border-red-500' : ''}
              ${isSelectedDay ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            `}
              onClick={() => day.isCurrentMonth && handleDayClick(day)} // Only allow clicks for days in the current month.
              role="gridcell" // ARIA role for a cell in a grid.
              aria-label={`${day.date.toLocaleDateString('default', { day: 'numeric', month: 'long' })} ${day.events.length} events`}
              aria-current={day.isToday ? 'date' : undefined} // ARIA for today's date.
              tabIndex={day.isCurrentMonth ? 0 : -1} // Make current month days focusable.
            >
              <span className={`text-sm font-medium ${day.isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                {day.date.getDate()} {/* Display the day number. */}
              </span>
              {/* Display event count if there are events on this day. */}
              {day.events.length > 0 && (
                <div className="mt-1 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-1" aria-hidden="true"></span>
                  <span className="text-xs text-gray-600">{day.events.length} event{day.events.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section to display events for the currently selected day. */}
      <div className="mt-8">
        <h3 className="mb-4 text-2xl font-bold text-gray-800" aria-live="polite">
          Events for{' '}
          {selectedDayEvents.length > 0
            ? new Date(selectedDayEvents[0].date).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Selected Day'}
          :
        </h3>
        {selectedDayEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {selectedDayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                // Pass register handler if in participant view, otherwise view details handler.
                onRegister={isParticipantView ? handleRegister : undefined}
                onViewDetails={handleViewDetails}
                isParticipantView={isParticipantView}
                registering={registeringEventId === event.id} // Highlight event being registered.
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-lg">No events scheduled for this day.</p>
        )}
      </div>

      {/* Modal for displaying detailed event information. */}
      <Modal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} title="Event Details">
        {selectedEvent ? (
          <EventDetails
            event={selectedEvent}
            onClose={handleCloseDetailsModal}
            onRegister={isParticipantView ? handleRegister : undefined}
            isParticipantView={isParticipantView}
            registering={registeringEventId === selectedEvent.id} // Highlight event being registered.
          />
        ) : (
          <LoadingSpinner /> // Show spinner while event details are loading (should be instantaneous with local state).
        )}
      </Modal>
    </div>
  );
};

export default Calendar;