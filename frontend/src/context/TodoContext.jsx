import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "text2act_todos";
const LISTS_KEY = "text2act_todo_lists";
const TAGS_KEY = "text2act_todo_tags";

const TodoContext = createContext();

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
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

const defaultLists = [
  { id: "personal", name: "Personal", color: "#dc3545" },
  { id: "work", name: "Work", color: "#0d6efd" },
  { id: "list1", name: "List 1", color: "#ffc107" },
];

export function TodoProvider({ children }) {
  const [todos, setTodos] = useState(() => loadJson(STORAGE_KEY, []));
  const [lists, setLists] = useState(() => loadJson(LISTS_KEY, defaultLists));
  const [tags, setTags] = useState(() => loadJson(TAGS_KEY, ["Tag 1", "Tag 2"]));

  useEffect(() => {
    saveJson(STORAGE_KEY, todos);
  }, [todos]);
  useEffect(() => {
    saveJson(LISTS_KEY, lists);
  }, [lists]);
  useEffect(() => {
    saveJson(TAGS_KEY, tags);
  }, [tags]);

  const addTodo = useCallback((todo) => {
    const entry = {
      id: todo.id ?? Date.now(),
      title: todo.title ?? "New task",
      description: todo.description ?? "",
      listId: todo.listId ?? lists[0]?.id ?? "personal",
      dueDate: todo.dueDate ?? null,
      tags: Array.isArray(todo.tags) ? todo.tags : [],
      subtasks: Array.isArray(todo.subtasks) ? todo.subtasks : [],
      scope: todo.scope ?? "day",
      completed: todo.completed ?? false,
      createdAt: todo.createdAt ?? new Date().toISOString(),
    };
    setTodos((prev) => [...prev, entry]);
    return entry.id;
  }, [lists]);

  const updateTodo = useCallback((id, updates) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const removeTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addList = useCallback((list) => {
    const id = list.id ?? (list.name?.toLowerCase().replace(/\s+/g, "-") || "list-" + Date.now());
    const entry = { id, name: list.name ?? "New list", color: list.color ?? "#6c757d" };
    setLists((prev) => (prev.some((l) => l.id === id) ? prev : [...prev, entry]));
    return id;
  }, []);

  const updateList = useCallback((id, updates) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const removeList = useCallback((id) => {
    setLists((prev) => {
      const next = prev.filter((l) => l.id !== id);
      const firstId = next[0]?.id ?? "personal";
      setTodos((todos) => todos.map((t) => (t.listId === id ? { ...t, listId: firstId } : t)));
      return next;
    });
  }, []);

  const addTag = useCallback((tag) => {
    const name = typeof tag === "string" ? tag : tag.name;
    if (!name || tags.includes(name)) return;
    setTags((prev) => [...prev, name]);
  }, [tags]);

  const updateTag = useCallback((oldName, newName) => {
    if (!newName || oldName === newName) return;
    setTags((prev) => prev.map((t) => (t === oldName ? newName : t)));
    setTodos((prev) => prev.map((t) => ({ ...t, tags: (t.tags || []).map((tag) => (tag === oldName ? newName : tag)) })));
  }, []);

  const removeTag = useCallback((name) => {
    setTags((prev) => prev.filter((t) => t !== name));
    setTodos((prev) => prev.map((t) => ({ ...t, tags: (t.tags || []).filter((tag) => tag !== name) })));
  }, []);

  const getTodosByScope = useCallback((scope) => {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    return todos.filter((t) => {
      if (t.scope !== scope) return false;
      if (!t.dueDate) return true;
      const d = t.dueDate.slice(0, 10);
      if (scope === "day") return d === today;
      if (scope === "weekly") return d >= weekStart.toISOString().slice(0, 10) && d <= weekEnd.toISOString().slice(0, 10);
      if (scope === "monthly") return d.startsWith(monthStart.slice(0, 7));
      return true;
    });
  }, [todos]);

  const upcomingTodos = todos.filter((t) => !t.completed && (t.dueDate ? t.dueDate >= new Date().toISOString().slice(0, 10) : true));

  return (
    <TodoContext.Provider
      value={{
        todos,
        lists,
        tags,
        addTodo,
        updateTodo,
        removeTodo,
        addList,
        updateList,
        removeList,
        addTag,
        updateTag,
        removeTag,
        getTodosByScope,
        upcomingTodos,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  return useContext(TodoContext);
}
