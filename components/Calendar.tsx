import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, CalendarDay } from '../types';
import Button from './Button';
import EventCard from './EventCard';
import Modal from './Modal';
import EventDetails from './EventDetails';
import LoadingSpinner from './LoadingSpinner';

interface CalendarProps {
  events: Event[];
  onRegisterEvent?: (eventId: string) => Promise<void>;
  isParticipantView?: boolean;
  registeringEventId?: string | null;
}

const Calendar: React.FC<CalendarProps> = ({ events, onRegisterEvent, isParticipantView, registeringEventId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay(); // 0-Sunday, 1-Monday...

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const calendarDays: CalendarDay[] = useMemo(() => {
    const totalDays = daysInMonth(currentYear, currentMonth);
    // Adjust first day of month to start week on Monday (assuming 0=Sunday, 1=Monday)
    // If firstDay is Sunday (0), we want 6 preceding days (from previous month) for Monday start.
    // (firstDay + 6) % 7 ensures Monday is 0, Tuesday 1, ..., Sunday 6.
    const firstDay = firstDayOfMonth(currentYear, currentMonth);
    const prevMonthDays = (firstDay === 0 ? 6 : firstDay - 1); // If Sunday, 6 days. Else, firstDay - 1.
    
    const monthCalendarDays: CalendarDay[] = [];

    // Fill preceding empty days (from previous month)
    for (let i = 0; i < prevMonthDays; i++) {
      monthCalendarDays.push({
        date: new Date(currentYear, currentMonth, i - prevMonthDays + 1), // This will be a day from prev month
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(currentYear, currentMonth, i);
      const today = new Date();
      const isToday =
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();

      monthCalendarDays.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: isToday,
        events: [], // Events will be populated below
      });
    }
    
    // Fill trailing empty days (from next month)
    const totalCells = monthCalendarDays.length;
    const remainingCells = 42 - totalCells; // Max 6 rows * 7 days = 42 cells
    if (remainingCells > 0) {
      for (let i = 1; i <= remainingCells; i++) {
        monthCalendarDays.push({
          date: new Date(currentYear, currentMonth + 1, i), // Days from next month
          isCurrentMonth: false,
          isToday: false,
          events: [],
        });
      }
    }


    return monthCalendarDays;
  }, [currentYear, currentMonth]);

  useEffect(() => {
    // Populate events into calendarDays (a deep copy is necessary for day.events to be mutable)
    const updatedCalendarDays = calendarDays.map(day => ({ ...day, events: [] })); // Create new array of objects
    
    events.forEach((event) => {
      const eventDate = new Date(event.date);
      const targetDay = updatedCalendarDays.find((day) =>
        day.date.getDate() === eventDate.getDate() &&
        day.date.getMonth() === eventDate.getMonth() &&
        day.date.getFullYear() === eventDate.getFullYear()
      );
      if (targetDay) {
        targetDay.events.push(event);
      }
    });

    updatedCalendarDays.forEach(day => {
      day.events.sort((a, b) => a.startTime.localeCompare(b.startTime)); // Sort by start time
    });

    const today = new Date(); // To check for 'today' outside the useMemo for consistency
    // Automatically select the current day if it's in the current month, otherwise the 1st
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
      // If today has no events or is not in current month, select events for the first day of the current month
      setSelectedDayEvents(updatedCalendarDays.filter(day => day.isCurrentMonth)[0]?.events || []);
    }
  }, [events, calendarDays]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDayEvents(day.events);
  };

  const handleViewDetails = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleRegister = useCallback(
    async (eventId: string) => {
      if (onRegisterEvent) {
        try {
          await onRegisterEvent(eventId);
          // Refresh events on parent component if needed, or rely on state propagation
          // A real app might refetch or update the event in local state
        } catch (error) {
          console.error("Failed to register for event:", error);
          alert(`Registration failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    },
    [onRegisterEvent]
  );

  // Adjusted daysOfWeek to start with Monday
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentYear}
        </h2>
        <div className="flex gap-2">
          <Button onClick={goToPreviousMonth} variant="secondary" size="sm">
            Prev
          </Button>
          <Button onClick={goToToday} variant="secondary" size="sm">
            Today
          </Button>
          <Button onClick={goToNextMonth} variant="secondary" size="sm">
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center font-semibold text-gray-700 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {calendarDays.map((day, index) => {
          // Fix: Correctly compare dates to determine if the day is selected
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
              className={`relative p-2 rounded-md h-20 sm:h-24 flex flex-col justify-between items-center text-center cursor-pointer transition-colors duration-150
              ${day.isCurrentMonth ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              ${day.isToday ? 'border-2 border-blue-500 bg-blue-100 hover:bg-blue-200' : ''}
              ${isSelectedDay ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            `}
              onClick={() => day.isCurrentMonth && handleDayClick(day)}
            >
              <span className={`text-sm font-medium ${day.isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                {day.date.getDate()}
              </span>
              {day.events.length > 0 && (
                <div className="mt-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                  <span className="text-xs text-gray-600">{day.events.length} event{day.events.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-2xl font-bold text-gray-800">
          Events for{' '}
          {selectedDayEvents.length > 0
            ? new Date(selectedDayEvents[0].date).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Selected Day'}
          :
        </h3>
        {selectedDayEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={isParticipantView ? handleRegister : undefined}
                onViewDetails={handleViewDetails}
                isParticipantView={isParticipantView}
                registering={registeringEventId === event.id}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-lg">No events scheduled for this day.</p>
        )}
      </div>

      <Modal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} title="Event Details">
        {selectedEvent ? (
          <EventDetails
            event={selectedEvent}
            onClose={handleCloseDetailsModal}
            onRegister={isParticipantView ? handleRegister : undefined}
            isParticipantView={isParticipantView}
            registering={registeringEventId === selectedEvent.id}
          />
        ) : (
          <LoadingSpinner />
        )}
      </Modal>
    </div>
  );
};

export default Calendar;