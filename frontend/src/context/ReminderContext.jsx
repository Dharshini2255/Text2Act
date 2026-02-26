import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "text2act_reminders";

const ReminderContext = createContext();

function loadReminders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReminders(reminders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.warn("Failed to save reminders", e);
  }
}

export function ReminderProvider({ children }) {
  const [reminders, setReminders] = useState(loadReminders);

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  const addReminder = useCallback((reminder) => {
    const entry = {
      id: reminder.id ?? Date.now(),
      title: reminder.title ?? "Reminder",
      date: reminder.date ?? new Date().toISOString().slice(0, 10),
      time: reminder.time ?? null,
      priority: reminder.priority ?? "medium",
      createdAt: reminder.createdAt ?? new Date().toISOString(),
      alarmSnoozedUntil: reminder.alarmSnoozedUntil ?? null,
      alarmFiredAt: reminder.alarmFiredAt ?? null,
    };
    setReminders((prev) => [...prev, entry]);
    return entry.id;
  }, []);

  const updateReminder = useCallback((id, updates) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const removeReminder = useCallback((id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <ReminderContext.Provider
      value={{ reminders, addReminder, updateReminder, removeReminder }}
    >
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  return useContext(ReminderContext);
}
