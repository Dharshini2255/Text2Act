import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "text2act_notes";

const NotesContext = createContext();

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.warn("Failed to save notes", e);
  }
}

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState(loadNotes);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const addNote = useCallback((note) => {
    const entry = {
      id: note.id ?? Date.now(),
      title: note.title ?? "Untitled note",
      content: note.content ?? "",
      type: note.type ?? "generated_notes",
      sourceDocument: note.sourceDocument ?? null,
      keyPoints: Array.isArray(note.keyPoints) ? note.keyPoints : [],
      createdAt: note.createdAt ?? new Date().toISOString(),
    };
    setNotes((prev) => [...prev, entry]);
    return entry.id;
  }, []);

  const updateNote = useCallback((id, updates) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  }, []);

  const removeNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, removeNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
