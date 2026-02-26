import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "text2act_history";

const HistoryContext = createContext();

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJson(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save", key, e);
  }
}

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState(() => loadJson(STORAGE_KEY, []));
  const [lastDetected, setLastDetected] = useState(null);
  useEffect(() => {
    saveJson(STORAGE_KEY, history);
  }, [history]);

  const addToHistory = useCallback((item) => {
    const entry = {
      id: item.id ?? Date.now(),
      type: item.type ?? "action",
      summary: item.summary ?? "",
      payload: item.payload ?? {},
      timestamp: item.timestamp ?? new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 200));
  }, []);

  const setDetected = useCallback((detected) => {
    setLastDetected(detected);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <HistoryContext.Provider
      value={{ history, lastDetected, addToHistory, setDetected, clearHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}
