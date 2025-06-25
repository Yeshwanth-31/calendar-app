import React from "react";
import dayjs from "dayjs";

// Helper: group events by date string
function groupEventsByDate(events) {
  return events.reduce((acc, event) => {
    (acc[event.date] = acc[event.date] || []).push(event);
    return acc;
  }, {});
}

// Helper: detect overlapping events (returns array of booleans)
function getEventOverlaps(events) {
  if (events.length < 2) return events.map(() => false);
  // Sort by startTime
  const sorted = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
  let overlaps = Array(events.length).fill(false);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime < sorted[i - 1].endTime) {
      overlaps[i] = true;
      overlaps[i - 1] = true;
    }
  }
  // Map back to original order
  return events.map((e) =>
    sorted.findIndex((ev) => ev === e) !== -1 && overlaps[sorted.findIndex((ev) => ev === e)]
  );
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const timeLabels = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`
);

export default function Calendar({
  month,
  events,
  onEventClick,
  onShowAllEvents,
  onCreateEvent,
  selectedDate,
  onSelectDate,
  view = "month",
  onShowMonthEvents,
}) {
  // Calculate grid days
  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");
  const startDay = startOfMonth.day();
  const totalDays = endOfMonth.date();
  const today = dayjs();

  // Generate all days to display in the grid (including prev/next month padding)
  const days = [];
  const totalCells = Math.ceil((startDay + totalDays) / 7) * 7;
  for (let i = 0; i < totalCells; i++) {
    const date = startOfMonth.add(i - startDay, "day");
    days.push(date);
  }

  // Group events by date for quick lookup
  const eventsByDate = groupEventsByDate(events);

  // --- Month Events List View ---
  if (view === "month-list") {
    // Get all dates in this month
    const monthDates = Array.from({ length: totalDays }, (_, i) => startOfMonth.add(i, "day"));
    // Build a 2D array: rows = dates, columns = hours (0-23)
    const grid = monthDates.map((date) => {
      const dateStr = date.format("YYYY-MM-DD");
      const dayEvents = (eventsByDate[dateStr] || []).map((ev) => ({
        ...ev,
        startHour: parseInt(ev.startTime.split(":")[0], 10),
        endHour: parseInt(ev.endTime.split(":")[0], 10),
        startMin: parseInt(ev.startTime.split(":")[1] || "0", 10),
        endMin: parseInt(ev.endTime.split(":")[1] || "0", 10),
      }));
      return {
        date,
        events: dayEvents,
      };
    });

    return (
      <div className="bg-white rounded-2xl shadow p-2 sm:p-4 w-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Month Events List</h2>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            onClick={() => onShowMonthEvents && onShowMonthEvents(false)}
          >
            Back to Calendar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-gray-50 text-left">Date</th>
                {timeLabels.map((label, i) => (
                  <th key={i} className="border px-2 py-1 bg-gray-50 text-center">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map(({ date, events }) => (
                <tr key={date.format("YYYY-MM-DD")}>
                  <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                    {date.format("MMM D (ddd)")}
                  </td>
                  {timeLabels.map((_, hour) => {
                    // Find event(s) that start at this hour
                    const evs = events.filter(
                      (ev) =>
                        ev.startHour === hour ||
                        (ev.startHour < hour && ev.endHour > hour) ||
                        (ev.startHour === hour && ev.startMin === 0)
                    );
                    if (evs.length === 0) {
                      return <td key={hour} className="border px-1 py-1 bg-white"></td>;
                    }
                    // Show all events in this slot
                    return (
                      <td key={hour} className="border px-1 py-1 bg-blue-100 cursor-pointer">
                        {evs.map((ev, idx) => (
                          <div
                            key={idx}
                            className="rounded px-1 py-0.5 mb-0.5 text-xs font-semibold text-blue-900 truncate"
                            style={{
                              background: ev.color,
                              color: "#fff",
                              minWidth: 60,
                            }}
                            title={`${ev.title} (${ev.startTime} - ${ev.endTime})`}
                            onClick={() => onEventClick && onEventClick(ev)}
                          >
                            {ev.title}
                            <div className="text-[10px] font-normal text-white/80">
                              {ev.startTime} - {ev.endTime}
                            </div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- Main Calendar View ---
  // Popup state for selected date
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [popupIdx, setPopupIdx] = React.useState(null);
  const calendarRef = React.useRef(null);

  // Tooltip state for event hover (fix: only one tooltip at a time)
  const [hoveredEvent, setHoveredEvent] = React.useState(null);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });

  // Show popup when selectedDate changes
  React.useEffect(() => {
    if (!selectedDate) {
      setPopupOpen(false);
      setPopupIdx(null);
      return;
    }
    // Find the cell index for the selected date
    const idx = days.findIndex(d => d.format("YYYY-MM-DD") === selectedDate);
    setPopupIdx(idx);
    setPopupOpen(true);
  }, [selectedDate, view, days]);

  return (
    <div className="bg-white rounded-2xl shadow p-2 sm:p-4 w-full" ref={calendarRef} style={{ position: "relative" }}>
      <div className="flex items-center justify-between mb-2">
        <div />
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          onClick={() => onShowMonthEvents && onShowMonthEvents(true)}
        >
          Month Events List
        </button>
      </div>
      {/* Day Labels */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-1 border-b border-gray-200">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-2xl overflow-hidden relative">
        {days.map((date, idx) => {
          const isCurrentMonth = date.month() === month.month();
          const isToday =
            date.isSame(today, "date") &&
            date.isSame(today, "month") &&
            date.isSame(today, "year");
          const dateStr = date.format("YYYY-MM-DD");
          const isSelected = selectedDate === dateStr;
          const dayEvents = (eventsByDate[dateStr] || []).sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          );
          const overlaps = getEventOverlaps(dayEvents);

          // Show only up to 2 events, then "+X more"
          const maxVisible = 2;
          const visibleEvents = dayEvents.slice(0, maxVisible);
          const extraCount = dayEvents.length - maxVisible;

          return (
            <div
              key={idx}
              data-date={dateStr}
              className={`
                relative flex flex-col items-start px-2 pt-2 pb-4 min-h-[120px] h-[120px] bg-white
                border border-gray-200 cursor-pointer
                ${isToday ? "z-10 border-blue-500 bg-blue-50" : ""}
                ${isSelected ? "z-20 border-2 border-blue-500" : ""}
                ${!isCurrentMonth ? "bg-gray-50 text-gray-300" : ""}
              `}
              style={isSelected ? { boxShadow: "0 0 0 2px #2563eb, 0 0 0 4px #fff" } : {}}
              onClick={() => {
                onSelectDate && onSelectDate(dateStr);
              }}
              onDoubleClick={() => isCurrentMonth && onCreateEvent(dateStr)}
            >
              <div className="flex items-center gap-1 mb-1 w-full">
                <span
                  className={`
                    text-base font-semibold
                    ${isToday ? "bg-blue-600 text-white rounded-full px-2 py-1" : isCurrentMonth ? "text-gray-800" : "text-gray-300"}
                  `}
                  style={
                    isToday
                      ? {
                          minWidth: 28,
                          display: "inline-block",
                          textAlign: "center",
                        }
                      : {}
                  }
                >
                  {date.date()}
                </span>
              </div>
              {/* Events */}
              <div className="flex flex-col gap-1 w-full pr-1">
                {isCurrentMonth &&
                  visibleEvents.map((event, i) => {
                    const isConflict = overlaps[i];
                    // --- FIX: Remove useState from here, use parent state ---
                    // Tooltip for normal events (timing)
                    const showTooltip = hoveredEvent === event;
                    const eventTooltip = (
                      showTooltip && (
                        <div
                          className="pointer-events-none z-50"
                          style={{
                            position: "fixed",
                            left: tooltipPos.x,
                            top: tooltipPos.y,
                            transform: "translateY(-110%)",
                          }}
                        >
                          <div
                            className="rounded-lg shadow-xl border border-blue-200 bg-white px-4 py-2 min-w-[120px] max-w-xs"
                            style={{
                              background: "linear-gradient(135deg, #f0f4f8 60%, #e0e7ef 100%)",
                              boxShadow: "0 8px 32px 0 rgba(31,38,135,0.14)",
                              borderColor: "#bfdbfe"
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ background: event.color }}
                              />
                              <span className="font-semibold text-gray-800 text-sm truncate">{event.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-700 font-bold">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline-block mr-1" style={{ verticalAlign: "middle" }}>
                                <rect x="4" y="4" width="16" height="16" rx="4" fill="#3b82f6"/>
                                <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              {event.startTime} - {event.endTime}
                            </div>
                          </div>
                        </div>
                      )
                    );

                    return (
                      <div
                        key={i}
                        className={`
                          w-full text-xs rounded px-2 py-1 truncate font-medium flex items-center gap-2
                          border border-gray-200 bg-gray-100 hover:bg-blue-100 transition
                          ${isToday ? "bg-blue-50 text-blue-900 border-blue-200" : ""}
                          ${isConflict ? "border-red-500 bg-red-50 hover:bg-red-100 relative" : ""}
                        `}
                        style={{
                          borderLeft: `3px solid ${event.color}`,
                          ...(isConflict ? { borderColor: "#ef4444" } : {}),
                          cursor: "pointer",
                          position: "relative"
                        }}
                        onMouseEnter={e => {
                          if (!isConflict) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPos({
                              x: rect.right + 8,
                              y: rect.top + 8
                            });
                            setHoveredEvent(event);
                          }
                        }}
                        onMouseLeave={() => {
                          if (!isConflict) setHoveredEvent(null);
                        }}
                        onClick={ev => {
                          ev.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <span className="font-semibold">{event.title}</span>
                        {/* Red circle for conflict, with tooltip on hover */}
                        {isConflict && (
                          <span
                            className="ml-auto flex items-center"
                            style={{ position: "relative" }}
                          >
                            <span
                              className="inline-block w-3 h-3 rounded-full bg-red-500"
                              style={{ cursor: "pointer", position: "relative" }}
                              onMouseEnter={e => {
                                // Remove any existing tooltip
                                const oldTooltip = document.getElementById("conflict-tooltip");
                                if (oldTooltip) oldTooltip.remove();
                                // Create tooltip
                                const tooltip = document.createElement("div");
                                tooltip.id = "conflict-tooltip";
                                tooltip.innerHTML = `
                                  <div style="
                                    padding: 10px 16px;
                                    border-radius: 10px;
                                    background: linear-gradient(135deg, #fee2e2 60%, #fecaca 100%);
                                    color: #b91c1c;
                                    font-weight: 600;
                                    font-size: 13px;
                                    box-shadow: 0 6px 24px 0 rgba(239,68,68,0.15);
                                    border: 1px solid #fecaca;
                                    min-width: 160px;
                                    max-width: 260px;
                                    white-space: pre-line;
                                    ">
                                    <span style="display: flex; align-items: center; gap: 8px;">
                                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10" fill="#ef4444"/><text x="12" y="17" text-anchor="middle" font-size="16" fill="white" font-family="Arial" font-weight="bold">!</text></svg>
                                      Conflict: This event overlaps with another event.
                                    </span>
                                  </div>
                                `;
                                tooltip.style.position = "fixed";
                                tooltip.style.left = `${e.clientX + 12}px`;
                                tooltip.style.top = `${e.clientY - 36}px`;
                                tooltip.style.zIndex = 9999;
                                tooltip.style.pointerEvents = "none";
                                document.body.appendChild(tooltip);
                                e.currentTarget._tooltip = tooltip;
                              }}
                              onMouseLeave={e => {
                                if (e.currentTarget._tooltip) {
                                  document.body.removeChild(e.currentTarget._tooltip);
                                  e.currentTarget._tooltip = null;
                                }
                              }}
                            />
                          </span>
                        )}
                        {/* Custom tooltip for normal events */}
                        {eventTooltip}
                      </div>
                    );
                  })}
                {/* "+X more" */}
                {isCurrentMonth && extraCount > 0 && (
                  <button
                    className={`text-xs font-semibold mt-1 focus:outline-none
                      ${isToday ? "text-blue-700" : "text-blue-600"}
                      hover:underline`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      onShowAllEvents(dayEvents);
                    }}
                  >
                    +{extraCount} more
                  </button>
                )}
              </div>
              {/* Popup for selected date, rendered inside the cell */}
              {popupOpen && popupIdx === idx && (
                <div
                  className="absolute left-1/2 top-1/2 z-30 w-60 min-h-[120px] max-h-[320px] -translate-x-1/2 -translate-y-1/2 bg-[#f6f8fa] border border-gray-200 shadow-xl rounded-2xl flex flex-col p-4"
                  style={{
                    boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.10)",
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Close button in top-right corner */}
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-blue-500 text-lg"
                    style={{ lineHeight: 1 }}
                    onClick={() => {
                      setPopupOpen(false);
                      onSelectDate && onSelectDate(null);
                    }}
                  >
                    ×
                  </button>
                  <div className="flex flex-col items-center mb-3 mt-2">
                    <span className="text-xs text-gray-500 font-semibold uppercase">
                      {date.format("ddd")}
                    </span>
                    <span
                      className={
                        "text-3xl font-bold " +
                        (date.isSame(today, "date") && date.isSame(today, "month") && date.isSame(today, "year")
                          ? "bg-blue-600 text-white rounded-full px-5 py-1 shadow"
                          : "text-gray-800"
                        )
                      }
                      style={
                        date.isSame(today, "date") && date.isSame(today, "month") && date.isSame(today, "year")
                          ? { minWidth: 48, display: "inline-block", textAlign: "center" }
                          : {}
                      }
                    >
                      {date.date()}
                    </span>
                  </div>
                  <div
                    className="flex flex-col gap-2 flex-1 overflow-y-auto"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#d1d5db #f6f8fa"
                    }}
                  >
                    {/* Custom scrollbar for webkit browsers */}
                    <style>
                      {`
                        .popup-scroll::-webkit-scrollbar {
                          width: 6px;
                        }
                        .popup-scroll::-webkit-scrollbar-thumb {
                          background: #d1d5db;
                          border-radius: 4px;
                        }
                        .popup-scroll::-webkit-scrollbar-track {
                          background: #f6f8fa;
                        }
                      `}
                    </style>
                    <div className="popup-scroll">
                      {dayEvents.length === 0 ? (
                        <div className="bg-[#e8f0fe] text-blue-600 rounded px-2 py-2 text-sm text-center font-semibold border border-blue-100">
                          (No events)
                        </div>
                      ) : (
                        dayEvents.map((ev, i) => {
                          const isConflict = overlaps[i];
                          return (
                            <div
                              key={i}
                              className={`
                                rounded px-2 py-2 text-sm font-semibold cursor-pointer flex items-center gap-2
                                bg-[#f0f4f8] hover:bg-[#e0e7ef] transition border border-gray-100
                                ${isConflict ? "border-red-500 bg-red-50 hover:bg-red-100 relative" : ""}
                              `}
                              style={{
                                borderLeft: `4px solid ${ev.color || "#3b82f6"}`,
                                ...(isConflict ? { borderColor: "#ef4444" } : {})
                              }}
                              // Tooltip: show timings for normal, conflict message for conflict
                              title={
                                isConflict
                                  ? undefined
                                  : (ev.startTime && ev.endTime
                                      ? `${ev.startTime} - ${ev.endTime}`
                                      : undefined)
                              }
                              onClick={() => {
                                onEventClick && onEventClick(ev);
                                setPopupOpen(false);
                                onSelectDate && onSelectDate(null);
                              }}
                            >
                              <span className="truncate text-gray-800">{ev.title || "(No title)"}</span>
                              {/* Red circle for conflict, with tooltip on hover */}
                              {isConflict && (
                                <span
                                  className="ml-auto flex items-center"
                                  style={{ position: "relative" }}
                                >
                                  <span
                                    className="inline-block w-3 h-3 rounded-full bg-red-500"
                                    style={{ cursor: "pointer", position: "relative" }}
                                    onMouseEnter={e => {
                                      // Remove any existing tooltip
                                      const parent = e.currentTarget.parentNode;
                                      const oldTooltip = parent.querySelector('[data-tooltip="conflict"]');
                                      if (oldTooltip) oldTooltip.remove();
                                      // Create tooltip
                                      const tooltip = document.createElement("div");
                                      tooltip.innerText = "Conflict: This event overlaps with another event.";
                                      tooltip.className =
                                        "z-50 bg-red-500 text-white text-xs rounded px-2 py-1 shadow pointer-events-none";
                                      tooltip.style.position = "fixed";
                                      tooltip.style.whiteSpace = "nowrap";
                                      tooltip.style.top = `${e.clientY - 36}px`;
                                      tooltip.style.left = `${e.clientX + 12}px`;
                                      tooltip.style.transform = "none";
                                      tooltip.style.margin = "0";
                                      tooltip.setAttribute("data-tooltip", "conflict");
                                      document.body.appendChild(tooltip);
                                      e.currentTarget._tooltip = tooltip;
                                    }}
                                    onMouseLeave={e => {
                                      if (e.currentTarget._tooltip) {
                                        document.body.removeChild(e.currentTarget._tooltip);
                                        e.currentTarget._tooltip = null;
                                      }
                                    }}
                                  />
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-gray-400 mt-2">
        <span>Tip: Double-click a day to create a new event.</span>
      </div>
    </div>
  );
}
