import { useState } from "react";
import "../styles/CalendarPage.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const EVENT_COLORS = {
  project: "#2563EB",
  assignment: "#F59E0B",
  deadline: "#EF4444",
  meeting: "#8B5CF6",
};

const MOCK_EVENTS = [
  { id: 1, title: "Project Alpha Deadline", date: new Date().toISOString().split("T")[0], type: "deadline" },
  { id: 2, title: "Team Meeting", date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], type: "meeting" },
  { id: 3, title: "Assignment #5 Due", date: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0], type: "assignment" },
  { id: 4, title: "Project Beta Review", date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0], type: "project" },
  { id: 5, title: "Submit Weekly Report", date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0], type: "assignment" },
];

const CalendarPage = () => {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "meeting" });

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrent((p) => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
  };
  const nextMonth = () => {
    setCurrent((p) => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });
  };

  const dateStr = (day) => `${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const eventsOn = (day) => events.filter((e) => e.date === dateStr(day));
  const isToday = (day) => dateStr(day) === today.toISOString().split("T")[0];

  const addEvent = () => {
    if (!newEvent.title.trim() || !selectedDate) return;
    setEvents((prev) => [...prev, { id: Date.now(), ...newEvent, date: selectedDate }]);
    setNewEvent({ title: "", type: "meeting" });
    setShowForm(false);
  };

  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-page">
      <div className="calendar-main">
        {/* Header */}
        <div className="cal-header">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <div className="cal-title">
            <span className="cal-month">{MONTHS[current.month]}</span>
            <span className="cal-year">{current.year}</span>
          </div>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          <button className="cal-today-btn" onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth() })}>
            Today
          </button>
        </div>

        {/* Day labels */}
        <div className="cal-days-header">
          {DAYS.map((d) => <div key={d} className="cal-day-label">{d}</div>)}
        </div>

        {/* Grid */}
        <div className="cal-grid">
          {cells.map((day, i) => (
            <div key={i} className={`cal-cell${!day ? " empty" : ""}${isToday(day) ? " today" : ""}${day && selectedDate === dateStr(day) ? " selected" : ""}`}
              onClick={() => day && setSelectedDate(dateStr(day))}>
              {day && (
                <>
                  <span className="cal-day-num">{day}</span>
                  <div className="cal-events">
                    {eventsOn(day).slice(0, 2).map((e) => (
                      <div key={e.id} className="cal-event-dot" style={{ background: EVENT_COLORS[e.type] }}
                        title={e.title} />
                    ))}
                    {eventsOn(day).length > 2 && (
                      <div className="cal-event-more">+{eventsOn(day).length - 2}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="calendar-sidebar">
        <div className="cal-sidebar-header">
          <span>{selectedDate ? new Date(selectedDate + "T00:00:00").toDateString() : "Select a date"}</span>
          {selectedDate && (
            <button className="cal-add-btn" onClick={() => setShowForm(true)}>+ Add</button>
          )}
        </div>

        {showForm && (
          <div className="cal-event-form">
            <input
              className="cal-form-input"
              placeholder="Event title..."
              value={newEvent.title}
              onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
            />
            <select className="cal-form-select" value={newEvent.type}
              onChange={(e) => setNewEvent((p) => ({ ...p, type: e.target.value }))}>
              <option value="meeting">Meeting</option>
              <option value="project">Project</option>
              <option value="assignment">Assignment</option>
              <option value="deadline">Deadline</option>
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cal-save-btn" onClick={addEvent}>Save</button>
              <button className="cal-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="cal-event-list">
          {selectedEvents.length === 0 ? (
            <div className="cal-no-events">No events for this date.</div>
          ) : selectedEvents.map((e) => (
            <div key={e.id} className="cal-event-item">
              <div className="cal-event-color" style={{ background: EVENT_COLORS[e.type] }} />
              <div className="cal-event-info">
                <div className="cal-event-title">{e.title}</div>
                <div className="cal-event-type">{e.type}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="cal-legend">
          {Object.entries(EVENT_COLORS).map(([type, color]) => (
            <div key={type} className="cal-legend-item">
              <div className="cal-legend-dot" style={{ background: color }} />
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
