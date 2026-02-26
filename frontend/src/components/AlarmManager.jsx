import { useEffect, useState, useRef } from "react";
import { useReminders } from "../context/ReminderContext";

function AlarmModal({ reminder, onDismiss, onSnooze }) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 10000 }}
    >
      <div
        className="bg-white p-4 rounded shadow"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="d-flex align-items-center mb-3">
          <span className="fs-3 me-2">🔔</span>
          <h5 className="mb-0">Reminder</h5>
        </div>
        <p className="fw-bold mb-1">{reminder.title}</p>
        <p className="text-muted small mb-3">
          {reminder.date}
          {reminder.time && ` at ${reminder.time}`}
        </p>
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary" onClick={() => onSnooze(5)}>
            Snooze 5 min
          </button>
          <button className="btn btn-outline-secondary" onClick={() => onSnooze(10)}>
            Snooze 10 min
          </button>
          <button className="btn btn-primary" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlarmManager() {
  const { reminders, updateReminder } = useReminders();
  const [firing, setFiring] = useState(null);
  const firedRef = useRef(new Set());

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);


  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!reminders.length) return;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const r of reminders) {
      if (r.alarmFiredAt) continue;
      if (r.date !== today) continue;
      if (!r.time) continue;

      const [h, min] = r.time.split(":").map(Number);
      const reminderMinutes = h * 60 + min;
      const snoozed = r.alarmSnoozedUntil ? new Date(r.alarmSnoozedUntil) > now : false;
      if (snoozed) continue;

      if (nowMinutes >= reminderMinutes - 1) {
        const key = `${r.id}-${r.date}-${r.time}`;
        if (firedRef.current.has(key)) continue;
        firedRef.current.add(key);
        setFiring(r);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("Reminder", { body: r.title });
          } catch (_) {}
        }
        break;
      }
    }
  }, [reminders, tick]);

  if (!firing) return null;

  const handleDismiss = () => {
    updateReminder(firing.id, { alarmFiredAt: new Date().toISOString() });
    setFiring(null);
  };

  const handleSnooze = (minutes) => {
    const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    updateReminder(firing.id, { alarmSnoozedUntil: until });
    const key = `${firing.id}-${firing.date}-${firing.time}`;
    firedRef.current.delete(key);
    setFiring(null);
  };

  return (
    <AlarmModal
      reminder={firing}
      onDismiss={handleDismiss}
      onSnooze={handleSnooze}
    />
  );
}
