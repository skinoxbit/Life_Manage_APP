import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react';
import { useData, CalendarEvent } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

export const Calendar: React.FC = () => {
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useData();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '09:00',
    category: 'personal',
    color: 'bg-blue-500'
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };

  const handleAddEvent = () => {
    if (newEvent.title.trim()) {
      addCalendarEvent({
        ...newEvent,
        date: selectedDate || new Date()
      });
      setNewEvent({
        title: '',
        description: '',
        date: new Date(),
        time: '09:00',
        category: 'personal',
        color: 'bg-blue-500'
      });
      setIsAddingEvent(false);
    }
  };

  const handleEventDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggedEvent(eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEventDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleEventDrop = (e: React.DragEvent, targetEventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedEvent || draggedEvent === targetEventId) return;

    const reorderedEvents = [...calendarEvents];
    const draggedEventObj = reorderedEvents.find(e => e.id === draggedEvent);
    const targetEventObj = reorderedEvents.find(e => e.id === targetEventId);
    
    if (draggedEventObj && targetEventObj) {
      const draggedIndex = reorderedEvents.findIndex(e => e.id === draggedEvent);
      const targetIndex = reorderedEvents.findIndex(e => e.id === targetEventId);
      
      reorderedEvents.splice(draggedIndex, 1);
      reorderedEvents.splice(targetIndex, 0, draggedEventObj);
      
      // Update events
      reorderedEvents.forEach((event) => {
        updateCalendarEvent(event.id, { ...event });
      });
    }

    setDraggedEvent(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-32"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-32 p-2 border border-gray-200 dark:border-gray-700 cursor-pointer hover:${currentTheme.secondary} transition-colors ${
            isToday ? `${currentTheme.primary} text-white` : isSelected ? `${currentTheme.secondary}` : `${currentTheme.surface}`
          }`}
        >
          <div className={`font-semibold text-sm mb-1 ${isToday ? 'text-white' : currentTheme.text}`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 3).map((event, index) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate ${event.color} text-white`}
              >
                {event.title}
              </div>
            ))}
            {events.length > 3 && (
              <div className={`text-xs ${currentTheme.text} opacity-70`}>
                +{events.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className={`p-6 ${currentTheme.background} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>Calendar</h1>
            <p className={`${currentTheme.text} opacity-70`}>
              Manage your events and schedule
            </p>
          </div>
          <button
            onClick={() => setIsAddingEvent(true)}
            className={`mt-4 sm:mt-0 ${currentTheme.primary} text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center hover:scale-105`}
          >
            <Plus size={20} className="mr-2" />
            Add Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <div className={`${currentTheme.surface} rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className={`p-2 rounded-lg hover:${currentTheme.secondary} transition-colors ${currentTheme.text}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className={`p-2 rounded-lg hover:${currentTheme.secondary} transition-colors ${currentTheme.text}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-px mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={`text-center font-semibold py-3 ${currentTheme.text}`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {renderCalendarGrid()}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            {selectedDate && (
              <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
                <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4`}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className={`p-3 rounded-lg ${currentTheme.secondary}`}>
                      <div className={`flex items-center mb-2`}>
                        <div className={`w-3 h-3 rounded-full ${event.color} mr-2`}></div>
                        <h4 className={`font-medium ${currentTheme.text}`}>{event.title}</h4>
                      </div>
                      {event.time && (
                        <div className={`flex items-center text-sm ${currentTheme.text} opacity-70 mb-1`}>
                          <Clock size={14} className="mr-1" />
                          {event.time}
                        </div>
                      )}
                      {event.description && (
                        <p className={`text-sm ${currentTheme.text} opacity-80`}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {getEventsForDate(selectedDate).length === 0 && (
                    <p className={`text-center ${currentTheme.text} opacity-70 py-4`}>
                      No events for this day
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Add Event Form */}
            {isAddingEvent && (
              <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
                <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4`}>Add New Event</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className={`w-full px-3 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className={`w-full px-3 py-2 h-20 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${currentTheme.text}`}
                  />
                  <input
                    type="date"
                    value={newEvent.date.toISOString().split('T')[0]}
                    onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                    className={`w-full px-3 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                  />
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className={`w-full px-3 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddEvent}
                      className={`flex-1 ${currentTheme.primary} text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200`}
                    >
                      Add Event
                    </button>
                    <button
                      onClick={() => setIsAddingEvent(false)}
                      className={`flex-1 ${currentTheme.secondary} ${currentTheme.text} py-2 rounded-lg hover:shadow-lg transition-all duration-200`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};