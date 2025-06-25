import React, { useState, useEffect } from "react";
// import Header from "./components/Header"; // REMOVE THIS LINE
import Calendar from "./components/Calendar";
import EventModal from "./components/EventModal";
import { FaPlus, FaCalendarAlt } from "react-icons/fa";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import dayjs from "dayjs";
import eventsData from "./data/events.json";

// Helper to generate a unique id (simple incremental or timestamp-based)
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function App() {
  // Load events from localStorage or fallback to static JSON
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem("events");
    let loaded = stored ? JSON.parse(stored) : eventsData;
    // Ensure all events have an id
    loaded = loaded.map(ev => ev.id ? ev : { ...ev, id: generateId() });
    return loaded;
  });

  // Persist events to localStorage
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [modalType, setModalType] = useState("view"); // "view" | "create" | "list"
  const [modalEvents, setModalEvents] = useState([]);

  // Calendar navigation state
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState(null);

  // Add state for month events list view
  const [calendarView, setCalendarView] = useState("month"); // "month" | "month-list"

  // Open event details modal
  const handleEventClick = (event) => {
    setModalEvent(event);
    setModalType("view");
    setModalOpen(true);
  };

  // Open "all events" modal for a day
  const handleShowAllEvents = (events) => {
    setModalEvents(events);
    setModalType("list");
    setModalOpen(true);
  };

  // Open create event modal
  const handleCreateEvent = (date = null) => {
    setModalEvent(date ? { date } : null);
    setModalType("create");
    setModalOpen(true);
  };

  // Add or update event
  const handleAddEvent = (event) => {
    setEvents((prev) => {
      // If editing, modalEvent is the original event object
      if (
        modalType === "edit" ||
        (modalType === "view" && modalEvent && modalEvent.id) ||
        (modalType === "list" && modalEvent && modalEvent.id)
      ) {
        // Update by id
        return prev.map(e => e.id === modalEvent.id ? { ...event, id: modalEvent.id } : e);
      }
      // Otherwise, add new event with a new id
      return [...prev, { ...event, id: generateId() }];
    });
    setModalOpen(false);
  };

  // Remove event (optional, for demo)
  const handleDeleteEvent = (event) => {
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row font-sans">
      {/* Sidebar */}
      <aside className="hidden sm:flex flex-col w-16 bg-white shadow-lg py-6 items-center">
        {/* <FaCalendarAlt className="text-blue-600 text-3xl mb-8" /> */}
        {/* Add more icons here if needed */}
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Title */}
        <div className="px-4 pt-6 pb-2 bg-white shadow-sm">
          <span className="flex items-center gap-2 text-3xl font-bold text-blue-700">
            <FaCalendarAlt className="inline-block" /> Calendar
          </span>
        </div>
        {/* Header with month and controls */}
        <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentMonth.format("MMMM YYYY")}
            </h1>
            <div className="flex items-center gap-1 ml-2">
              <button
                className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition text-black flex items-center justify-center"
                onClick={() => setCurrentMonth((m) => m.subtract(1, "month"))}
                aria-label="Previous"
              >
                <MdOutlineKeyboardArrowLeft className="text-2xl" />
              </button>
              <button
                className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition text-black flex items-center justify-center"
                onClick={() => setCurrentMonth((m) => m.add(1, "month"))}
                aria-label="Next"
              >
                <MdOutlineKeyboardArrowRight className="text-2xl" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
              onClick={() => setCurrentMonth(dayjs().startOf("month"))}
              aria-label="Today"
            >
              Today
            </button>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              onClick={() => handleCreateEvent()}
            >
              <FaPlus /> Create Event
            </button>
          </div>
        </header>
        {/* Calendar */}
        <main className="flex-1 p-2 sm:p-6">
          <Calendar
            month={currentMonth}
            events={events}
            onEventClick={handleEventClick}
            onShowAllEvents={handleShowAllEvents}
            onCreateEvent={handleCreateEvent}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            view={calendarView}
            onShowMonthEvents={(show) => setCalendarView(show ? "month-list" : "month")}
          />
        </main>
      </div>
      {/* Modals */}
      {modalOpen && (
        <EventModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          event={modalEvent}
          events={modalEvents}
          onAdd={handleAddEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}