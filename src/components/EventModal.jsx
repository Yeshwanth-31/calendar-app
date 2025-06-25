import React, { useState } from "react";
import { FaTimes, FaTrash, FaEdit } from "react-icons/fa";
import dayjs from "dayjs";

// Modal overlay and container
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        {children}
      </div>
    </div>
  );
}

// Color picker for event creation
const COLORS = [
  "#f6be23", "#f6501e", "#3b82f6", "#10b981", "#e11d48", "#6366f1", "#f59e42"
];

export default function EventModal({
  open,
  onClose,
  type,
  event,
  events = [],
  onAdd,
  onDelete,
}) {
  // For create/edit form
  const [form, setForm] = useState(
    event
      ? {
          title: event.title || "",
          date: event.date || dayjs().format("YYYY-MM-DD"),
          startTime: event.startTime || "09:00",
          endTime: event.endTime || "10:00",
          color: event.color || COLORS[0],
        }
      : {
          title: "",
          date: dayjs().format("YYYY-MM-DD"),
          startTime: "09:00",
          endTime: "10:00",
          color: COLORS[0],
        }
  );
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(type === "edit");

  // For editing from list
  const [editEvent, setEditEvent] = useState(null);

  // Validate and submit new/edited event
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setError("End time must be after start time.");
      return;
    }
    setError("");
    onAdd({
      ...form,
      duration: undefined,
    });
  };

  // Edit mode for single event
  if ((type === "view" && editMode) || type === "edit") {
    return (
      <Modal open={open} onClose={onClose}>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: form.color }}
            ></span>
            <span className="text-lg font-bold">Edit Event</span>
          </span>
          <span className="flex gap-2">
            <button
              className="text-red-500 hover:text-red-700"
              title="Delete"
              onClick={() => onDelete(event)}
            >
              <FaTrash />
            </button>
            <button
              className="text-gray-400 hover:text-gray-700"
              title="Close"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Event Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <div className="flex gap-2">
            <input
              type="date"
              className="border rounded px-3 py-2 flex-1"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
            <input
              type="time"
              className="border rounded px-3 py-2 flex-1"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              required
            />
            <input
              type="time"
              className="border rounded px-3 py-2 flex-1"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Color:</span>
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 ${form.color === c ? "border-blue-500" : "border-white"}`}
                  style={{ background: c }}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                />
              ))}
            </div>
          </div>
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  // View mode for single event
  if (type === "view" && event) {
    return (
      <Modal open={open} onClose={onClose}>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: event.color }}
            ></span>
            <h2 className="text-lg font-bold">{event.title}</h2>
          </span>
          <span className="flex gap-2">
            <button
              className="text-blue-500 hover:text-blue-700"
              title="Edit"
              onClick={() => {
                setForm({
                  title: event.title,
                  date: event.date,
                  startTime: event.startTime,
                  endTime: event.endTime,
                  color: event.color,
                });
                setEditMode(true);
              }}
            >
              <FaEdit />
            </button>
            <button
              className="text-red-500 hover:text-red-700"
              title="Delete"
              onClick={() => onDelete(event)}
            >
              <FaTrash />
            </button>
            <button
              className="text-gray-400 hover:text-gray-700"
              title="Close"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </span>
        </div>
        <div className="text-sm text-gray-700 mb-2">
          <div>
            <span className="font-semibold">Date:</span>{" "}
            {dayjs(event.date).format("dddd, MMM D, YYYY")}
          </div>
          <div>
            <span className="font-semibold">Time:</span>{" "}
            {event.startTime} - {event.endTime}
          </div>
        </div>
      </Modal>
    );
  }

  // List mode: show all events for a day, with edit/delete/close icons at the top
  if (type === "list") {
    // If editing from list, show edit modal for that event
    if (editEvent) {
      return (
        <EventModal
          open={open}
          onClose={() => setEditEvent(null)}
          type="edit"
          event={editEvent}
          onAdd={(ev) => {
            onAdd(ev);
            setEditEvent(null);
            onClose();
          }}
          onDelete={(ev) => {
            onDelete(ev);
            setEditEvent(null);
            onClose();
          }}
        />
      );
    }
    return (
      <Modal open={open} onClose={onClose}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">All Events</h2>
          <span className="flex gap-2">
            <button
              className="text-gray-400 hover:text-gray-700"
              title="Close"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </span>
        </div>
        <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
          {events.map((ev, i) => (
            <div
              key={i}
              className="flex items-center gap-2 border-b pb-2"
              style={{ borderColor: ev.color }}
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: ev.color }}
              ></span>
              <div className="flex-1">
                <div className="font-semibold">{ev.title}</div>
                <div className="text-xs text-gray-500">
                  {ev.startTime} - {ev.endTime}
                </div>
              </div>
              <button
                className="text-blue-500 hover:text-blue-700"
                title="Edit"
                onClick={() => setEditEvent(ev)}
              >
                <FaEdit />
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                title="Delete"
                onClick={() => {
                  onDelete(ev);
                  setEditEvent(null);
                  onClose();
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <button
          className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </Modal>
    );
  }

  // Create event modal
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold">Create Event</span>
        <button
          className="text-gray-400 hover:text-gray-700"
          title="Close"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Event Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded px-3 py-2 flex-1"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
          <input
            type="time"
            className="border rounded px-3 py-2 flex-1"
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            required
          />
          <input
            type="time"
            className="border rounded px-3 py-2 flex-1"
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Color:</span>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`w-6 h-6 rounded-full border-2 ${form.color === c ? "border-blue-500" : "border-white"}`}
                style={{ background: c }}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
              />
            ))}
          </div>
        </div>
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Event
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
