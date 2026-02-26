/**
 * Classify user intent and extract structured data from text.
 * Keywords: add to reminder, add to to do list, generate key points, generate notes, dates (birthday etc).
 * Document: split by full stop; each sentence can be reminder, to-do, or notes.
 */

import { parseDate, parseTime, parsePriority, extractReminderFromText } from "./reminderExtractor";

const MONTHS = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Detect explicit intent from keywords (order matters) */
export function getIntent(text) {
  if (!text || typeof text !== "string") return null;
  const lower = text.toLowerCase().trim();
  // Explicit "add to the reminder" -> reminder
  if (/\badd\s+to\s+(the\s+)?reminder\b/.test(lower) || /\bremind\s+me\b/.test(lower) || /\breminder\s+for\b/.test(lower)) return "reminder";
  // "add to the to do list" / "add to todo" / "to do list for tomorrow" -> todo
  if (/\badd\s+to\s+(the\s+)?(to\s*\-?do|todo)\s*list\b/.test(lower) || /\b(to\s*\-?do|todo)\s*list\s+for\b/.test(lower) || /\badd\s+.*(to\s*\-?do|todo)\b/.test(lower)) return "todo";
  // "generate key points from the given document" / "generate notes from the given document"
  if (/\bgenerate\s+(key\s+points|notes)\s+(from\s+the\s+)?(given\s+)?document\b/.test(lower) || /\bkey\s+points\s+from\s+(the\s+)?document\b/.test(lower) || /\bnotes\s+from\s+(the\s+)?document\b/.test(lower)) return "notes";
  if (/\bgenerate\s+notes\b/.test(lower) || /\bgenerate\s+key\s+points\b/.test(lower)) return "notes";
  return null;
}

/** Parse due date for todo: "for tomorrow", "for today", "for 15 Jan", etc. */
export function parseTodoDueDate(text) {
  if (!text || typeof text !== "string") return null;
  const lower = text.toLowerCase().trim();
  const today = todayStr();
  if (/\bfor\s+tomorrow\b/.test(lower)) return addDays(today, 1);
  if (/\bfor\s+today\b/.test(lower)) return today;
  if (/\btomorrow\b/.test(lower) && !/\bfor\s+today\b/.test(lower)) return addDays(today, 1);
  const date = parseDate(text);
  return date || today;
}

/** Parse scope for todo: day, weekly, monthly */
export function parseTodoScope(text) {
  if (!text || typeof text !== "string") return "day";
  const lower = text.toLowerCase();
  if (/\b(weekly|week)\b/.test(lower)) return "weekly";
  if (/\b(monthly|month)\b/.test(lower)) return "monthly";
  return "day";
}

/** Extract title for todo from text (remove "add to todo list for tomorrow" etc) */
export function extractTodoTitle(text) {
  if (!text || typeof text !== "string") return "New task";
  let title = text
    .replace(/\badd\s+/gi, "")
    .replace(/\s+in\s+(the\s+)?(to\s*\-?do|todo)\s*list\s+for\s+(tomorrow|today)\s*\.?\s*$/gi, "")
    .replace(/\s+(the\s+)?(to\s*\-?do|todo)\s*list\s+for\s+(tomorrow|today)\s*\.?\s*$/gi, "")
    .replace(/\s+for\s+(tomorrow|today)\s*\.?\s*$/gi, "")
    .replace(/\s+for\s+tomorrow\b/gi, "")
    .replace(/\s+for\s+today\b/gi, "")
    .trim();
  return title || "New task";
}

/**
 * Split document content by full stop (sentence boundary). Handles multiple lines.
 */
export function splitBySentences(content) {
  if (!content || typeof content !== "string") return [];
  return content
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

/**
 * Classify a single sentence as reminder, todo, or notes (for document parsing).
 */
export function classifySentence(sentence) {
  if (!sentence || !sentence.trim()) return null;
  const lower = sentence.toLowerCase().trim();
  const hasDate = parseDate(sentence) || /\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(sentence) || /\b(today|tomorrow)\b/.test(lower) || /\b\d{4}-\d{2}-\d{2}\b/.test(sentence);
  const reminderWords = ["remind", "reminder", "birthday", "anniversary", "meeting", "appointment", "on", "by", "before", "due", "at"];
  const todoWords = ["complete", "finish", "do", "prepare", "submit", "to do", "todo", "task"];
  const noteWords = ["note", "key point", "summary", "summarize"];
  if (hasDate && reminderWords.some((w) => lower.includes(w))) return "reminder";
  if (hasDate && !todoWords.some((w) => lower.includes(w))) return "reminder"; // date + no todo -> often reminder (e.g. birthday)
  if (todoWords.some((w) => lower.includes(w))) return "todo";
  if (noteWords.some((w) => lower.includes(w))) return "notes";
  if (hasDate) return "reminder";
  return "todo"; // default short line to todo
}

export { parseDate, parseTime, parsePriority, extractReminderFromText };
