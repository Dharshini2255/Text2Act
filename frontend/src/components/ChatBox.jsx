import { useState, useRef } from "react";
import { useReminders } from "../context/ReminderContext";
import { useTodos } from "../context/TodoContext";
import { useNotes } from "../context/NotesContext";
import { useHistory } from "../context/HistoryContext";
import { extractReminderFromText } from "../utils/reminderExtractor";
import { generateKeyPointsFromText } from "../utils/notesGenerator";
import { extractTitle } from "../utils/textExtractor";
import { parseExcelForReminders } from "../utils/excelParser";
import {
  getIntent,
  parseTodoDueDate,
  parseTodoScope,
  extractTodoTitle,
  splitBySentences,
  classifySentence,
} from "../utils/textClassifier";

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingContent, setPendingContent] = useState(null);
  const fileInputRef = useRef(null);
  const { addReminder } = useReminders();
  const { addTodo, lists } = useTodos();
  const { addNote } = useNotes();
  const { addToHistory, setDetected } = useHistory();

  const addReminderFromExtracted = (extracted) => {
    if (!extracted) return;
    addReminder({
      id: Date.now(),
      title: extractTitle(trimmed,"REMINDER"),
      date: extracted.date,
      time: extracted.time,
      priority: extracted.priority,
    });
  };

  const processOnePiece = (text, detected, source = "manual") => {
    if (!text || !text.trim()) return;
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    const intent = getIntent(trimmed);

    if (intent === "reminder" || (intent !== "todo" && intent !== "notes")) {
      const reminderExtracted = extractReminderFromText(trimmed);
      if (reminderExtracted) {
        addReminderFromExtracted(reminderExtracted);
        detected.reminders.push(reminderExtracted);
        addToHistory({ type: "reminder", summary: `Reminder: ${reminderExtracted.title}`, payload: { ...reminderExtracted, path: "/reminders" } });
        return;
      }
    }

    if (intent === "todo" || /\b(to\s*\-?do|todo)\b/.test(lower) || /\b(complete|finish|do|prepare|submit)\b/.test(lower)) {
      const dueDate = parseTodoDueDate(trimmed);
      const scope = parseTodoScope(trimmed);
      const title = extractTitle(trimmed,"TODO").slice(0, 200);
      if (title && title !== "New task") {
        addTodo({
          title,
          scope,
          dueDate: dueDate || (scope === "day" ? new Date().toISOString().slice(0, 10) : null),
          listId: lists[0]?.id,
        });
        detected.todos.push({ title, scope, dueDate });
        addToHistory({ type: "todo", summary: `To-do: ${title} (${scope})`, payload: { title, scope, dueDate, path: "/todo" } });
        return;
      }
    }

    if (intent === "notes" || /\b(generate\s+)?(notes|key\s+points|summarize|summary)\b/.test(lower) && trimmed.length > 10) {
      const keyPoints = generateKeyPointsFromText(trimmed, 6);
      addNote({
        title: "Note: " + trimmed.slice(0, 40) + "…",
        content: trimmed,
        type: "generated_notes",
        keyPoints: keyPoints.length ? keyPoints : [trimmed],
      });
      detected.notes.push({ title: "Generated note" });
      addToHistory({ type: "note", summary: "Notes generated", payload: { path: "/notes" } });
      return;
    }

    const reminderExtracted = extractReminderFromText(trimmed);
    if (reminderExtracted) {
      addReminderFromExtracted(reminderExtracted);
      detected.reminders.push(reminderExtracted);
      addToHistory({ type: "reminder", summary: `Reminder: ${reminderExtracted.title}`, payload: reminderExtracted });
    }
  };

  const processDocumentContent = (content, source) => {
    const detected = { reminders: [], todos: [], notes: [], document: { source, content: content?.slice(0, 500) } };
    const sentences = splitBySentences(content);
    if (sentences.length > 1) {
      sentences.forEach((s) => {
        const type = classifySentence(s);
        if (type === "reminder") {
          const ext = extractReminderFromText(s);
          if (ext) { addReminderFromExtracted(ext); detected.reminders.push(ext); }
        } else if (type === "todo") {
          const dueDate = parseTodoDueDate(s);
          const scope = parseTodoScope(s);
          const title = extractTodoTitle(s).slice(0, 200) || s.slice(0, 80);
          addTodo({ title, scope, dueDate: dueDate || new Date().toISOString().slice(0, 10), listId: lists[0]?.id });
          detected.todos.push({ title });
        } else if (type === "notes") {
          const keyPoints = generateKeyPointsFromText(s, 4);
          addNote({ title: s.slice(0, 40) + "…", content: s, type: "generated_notes", keyPoints: keyPoints.length ? keyPoints : [s] });
          detected.notes.push({ title: "Note" });
        }
      });
    } else {
      processOnePiece(content, detected, source);
    }
      addToHistory({ type: "document", summary: `Document: ${source}`, payload: { source, path: "/notes" } });
    setDetected(detected);
  };

  const handleSend = () => {
    if (pendingContent) {
      processDocumentContent(pendingContent, pendingFile?.name || "Document");
      setPendingContent(null);
      setPendingFile(null);
      setMessage("");
      return;
    }
    if (!message.trim()) return;
    const text = message.trim();
    const detected = { reminders: [], todos: [], notes: [], document: null };
    processOnePiece(text, detected);
    if (detected.reminders.length || detected.todos.length || detected.notes.length) {
      setDetected(detected);
    } else {
      setDetected({ type: "message", summary: text.slice(0, 80), payload: { raw: text } });
    }
    setMessage("");
  };

  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = "";

  // ✅ STEP 1: EXCEL GETS TOP PRIORITY
  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    const reminders = await parseExcelForReminders(file);

    reminders.forEach((r) => {
      addReminder({
        id: Date.now() + Math.random(),
        title: r.title,
        date: r.date,
        priority: r.priority,
        recurring: r.recurring,
      });
    });

    setDetected({
      reminders,
      todos: [],
      notes: [],
      document: { source: file.name },
    });

    return; // ⛔ STOP HERE (do NOT fall through)
  }
   
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        setPendingContent(reader.result);
        setPendingFile(file);
        setMessage(`📎 [${file.name}] – Click Send to process`);
      };
      reader.readAsText(file);
    } else {
      setPendingFile(file);
      setPendingContent(`[Uploaded: ${file.name}. Paste content below and click Send, or click Send to log upload.]`);
      setMessage(`📎 [${file.name}] – Paste content and click Send to process`);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "50%",
        maxWidth: "700px",
        zIndex: 1000,
      }}
    >
      <div
        className="d-flex align-items-center px-3 py-2 bg-white shadow"
        style={{ borderRadius: "24px", border: "1px solid #ddd" }}
      >
        <button className="btn btn-link text-muted p-0 me-3" onClick={() => fileInputRef.current?.click()}>
          <i className="bi bi-paperclip fs-5"></i>
        </button>
        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".txt,.pdf,.docx,.xlsx" onChange={handleFileUpload} />
        <input
          type="text"
          className="form-control border-0 shadow-none"
          placeholder="e.g. Add complete the project to do list for tomorrow..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ fontSize: "0.95rem" }}
        />
        <button className="btn btn-primary ms-3 px-4 rounded-pill" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
