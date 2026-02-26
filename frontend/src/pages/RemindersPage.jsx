import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useReminders } from "../context/ReminderContext";
import TopBar from "../components/TopBar";
import SidePanel from "../components/SidePanel";

// -------- Event Detail Modal (Edit / Delete) --------
function EventDetailModal({ reminder, onClose, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(reminder.title);
  const [date, setDate] = useState(reminder.date?.slice(0, 10) || "");
  const [time, setTime] = useState(reminder.time || "09:00");
  const [priority, setPriority] = useState(reminder.priority || "medium");

  const handleSave = () => {
    onEdit({ title, date, time: time || null, priority });
    setEditing(false);
    onClose();
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.55)", zIndex: 9999 }} onClick={onClose}>
      <div className="bg-white p-4 rounded shadow position-relative" style={{ width: "400px", maxWidth: "90vw" }} onClick={(e) => e.stopPropagation()}>
        {editing ? (
          <>
            <h5 className="mb-3">Edit Reminder</h5>
            <div className="mb-2"><label className="form-label small">Title</label><input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="mb-2"><label className="form-label small">Date</label><input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="mb-2"><label className="form-label small">Time</label><input type="time" className="form-control" value={time} onChange={(e) => setTime(e.target.value)} /></div>
            <div className="mb-3"><label className="form-label small">Priority</label><select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-outline-danger btn-sm" onClick={() => { onDelete(); onClose(); }}>Delete</button>
              <div><button className="btn btn-secondary btn-sm me-2" onClick={() => setEditing(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button></div>
            </div>
          </>
        ) : (
          <>
            <h5>{reminder.title}</h5>
            <p className="text-muted mb-0">{reminder.date}{reminder.time ? ` at ${reminder.time}` : ""}</p>
            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-outline-danger btn-sm" onClick={() => { onDelete(); onClose(); }}>Delete</button>
              <div><button className="btn btn-secondary btn-sm me-2" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// -------- Add Reminder Form --------
function AddReminderForm({ initialDate, onClose, onAdded }) {
  const { addReminder } = useReminders();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addReminder({
      id: Date.now(),
      title: title.trim(),
      date,
      time: time || null,
      priority,
    });
    onAdded();
  };

  return (
    <>
      <h5 className="mb-3">Add Reminder</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="Reminder title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Time (optional)</label>
          <input
            type="time"
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add Reminder
          </button>
        </div>
      </form>
    </>
  );
}

export default function RemindersPage() {
  const { reminders, updateReminder, removeReminder } = useReminders();

  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Priority → color mapping
  const getColor = (priority) => {
    if (priority === "high") return "#dc3545"; // red
    if (priority === "low") return "#198754"; // green
    return "#0d6efd"; // blue
  };

  // Convert reminders → calendar events (with time when set)
  const events = reminders.map((r) => {
    const start = r.time ? `${r.date}T${r.time}:00` : r.date;
    return {
      id: r.id,
      title: r.title,
      start,
      allDay: !r.time,
      backgroundColor: getColor(r.priority),
      borderColor: "transparent",
    };
  });

  return (
    <>
      <TopBar pageTitle="Reminders" onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearch={() => {}} />
      <div style={{ height: "calc(100vh - 56px)", overflow: "hidden", marginLeft: sidebarOpen ? 200 : 0 }}>
        {sidebarOpen && (
          <div style={{ position: "fixed", left: 0, top: 56, bottom: 0, width: 200, zIndex: 1050, overflowY: "auto" }}>
            <SidePanel />
          </div>
        )}
        <div className="container-fluid h-100 overflow-auto">
          <div className="row g-0">
          <div className="col p-4 overflow-auto">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Reminders</h4>

          <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Reminder
        </button>
      </div>

      <div className="row">
        {/* LEFT PANEL */}
        <div className="col-md-3">
          <div className="card mb-3 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold">Today</h6>
              <p className="mb-0 text-muted">
                {new Date().toDateString()}
              </p>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold">Legend</h6>

              <div className="mb-1">
                <span className="badge bg-danger me-2">&nbsp;</span>
                High Priority
              </div>

              <div className="mb-1">
                <span className="badge bg-primary me-2">&nbsp;</span>
                Medium Priority
              </div>

              <div>
                <span className="badge bg-success me-2">&nbsp;</span>
                Low Priority
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="col-md-9">
          <div className="bg-white p-3 rounded shadow">
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
              initialView="dayGridMonth"
              events={events}
              dateClick={(info) => {
                setSelectedDate(info.dateStr);
              }}
              eventClick={(info) => {
                setSelectedEvent(info.event);
              }}
              dayCellClassNames={(arg) => {
                const y = arg.date.getFullYear();
                const m = String(arg.date.getMonth() + 1).padStart(2, "0");
                const d = String(arg.date.getDate()).padStart(2, "0");
                const dateStr = `${y}-${m}-${d}`;
                return dateStr === selectedDate ? ["fc-day-selected-custom"] : [];
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              height="auto"
            />
          </div>
        </div>
      </div>

      {/* EVENT DETAILS MODAL - Edit / Delete */}
      {selectedEvent && (() => {
        const reminder = reminders.find((r) => String(r.id) === String(selectedEvent.id));
        return reminder ? (
          <EventDetailModal
            reminder={reminder}
            onClose={() => setSelectedEvent(null)}
            onEdit={(updates) => { updateReminder(reminder.id, updates); setSelectedEvent(null); }}
            onDelete={() => { removeReminder(reminder.id); setSelectedEvent(null); }}
          />
        ) : (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.55)", zIndex: 9999 }} onClick={() => setSelectedEvent(null)}>
            <div className="bg-white p-4 rounded shadow" style={{ width: "400px" }} onClick={(e) => e.stopPropagation()}>
              <h5>{selectedEvent.title}</h5>
              <p className="text-muted mb-0">{selectedEvent.start.toDateString()}</p>
              <div className="text-end mt-3"><button className="btn btn-secondary btn-sm" onClick={() => setSelectedEvent(null)}>Close</button></div>
            </div>
          </div>
        );
      })()}

      {/* ADD REMINDER MODAL - high z-index above calendar */}
      {showAddModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0,0,0,0.55)", zIndex: 9999 }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white p-4 rounded shadow position-relative overflow-auto"
            style={{ width: "400px", maxWidth: "100%", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <AddReminderForm
              initialDate={selectedDate || new Date().toISOString().slice(0, 10)}
              onClose={() => setShowAddModal(false)}
              onAdded={() => {
                setShowAddModal(false);
                setSelectedDate(null);
              }}
            />
          </div>
        </div>
      )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
