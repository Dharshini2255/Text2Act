/**
 * Extract reminder fields (title, date, time, priority) from free text.
 * Works with manual input, pasted text, or content from PDF/Word/Excel.
 */

const MONTHS = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec";
const MONTH_NUM = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseDate(text) {
  const lower = text.toLowerCase().trim();
  const today = todayStr();

  if (/\btoday\b/.test(lower)) return today;
  if (/\btomorrow\b/.test(lower)) return addDays(today, 1);

  // YYYY-MM-DD or YYYY/MM/DD
  const iso = text.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // "15 jan", "15 jan 2025", "jan 15", "january 15"
  const monthRegex = new RegExp(
    `\\b(\\d{1,2})\\s*(${MONTHS})\\s*(\\d{4})?\\b|\\b(${MONTHS})\\s*(\\d{1,2})\\s*(\\d{4})?\\b`,
    "i"
  );
  const monthMatch = text.match(monthRegex);
  if (monthMatch) {
    const y = new Date().getFullYear();
    let day, month;
    if (monthMatch[1] !== undefined) {
      day = parseInt(monthMatch[1], 10);
      month = (MONTH_NUM[monthMatch[2].toLowerCase().slice(0, 3)] || 1);
      const year = monthMatch[3] ? parseInt(monthMatch[3], 10) : y;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    if (monthMatch[4] !== undefined) {
      month = MONTH_NUM[monthMatch[4].toLowerCase().slice(0, 3)] || 1;
      day = parseInt(monthMatch[5], 10);
      const year = monthMatch[6] ? parseInt(monthMatch[6], 10) : y;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  // Keywords: "on 15th", "by 20th" - use current month
  const dayOnly = text.match(/\b(?:on|by|before|due)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
  if (dayOnly) {
    const d = new Date();
    const day = parseInt(dayOnly[1], 10);
    d.setDate(day);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return null;
}

export function parseTime(text) {
  // 3pm, 3:30pm, 15:00, 15:30
  const twelve = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (twelve) {
    let h = parseInt(twelve[1], 10);
    const m = twelve[2] ? parseInt(twelve[2], 10) : 0;
    if (twelve[3].toLowerCase() === "pm" && h < 12) h += 12;
    if (twelve[3].toLowerCase() === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const twentyFour = text.match(/\b(\d{1,2}):(\d{2})\b/);
  if (twentyFour) {
    const h = parseInt(twentyFour[1], 10);
    const m = parseInt(twentyFour[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
  }
  return null;
}

export function parsePriority(text) {
  const lower = text.toLowerCase();
  if (/\b(high|urgent|important|asap)\b/.test(lower)) return "high";
  if (/\b(low)\b/.test(lower)) return "low";
  return "medium";
}

/**
 * Extract reminder from text. Returns { title, date, time, priority } or null if not reminder-like.
 */
export function extractReminderFromText(text) {
  if (!text || typeof text !== "string" || !text.trim()) return null;

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  const reminderKeywords = ["remind", "reminder", "on", "by", "before", "due", "at", "meeting", "call", "submit", "deadline", "appointment"];
  const hasReminderHint = reminderKeywords.some((k) => lower.includes(k));
  const hasDate = parseDate(trimmed) || /\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(trimmed) || /\b(today|tomorrow)\b/.test(lower) || /\b\d{4}-\d{2}-\d{2}\b/.test(trimmed) || /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/.test(trimmed);

  if (!hasReminderHint && !hasDate) return null;

  const date = parseDate(trimmed) || todayStr();
  const time = parseTime(trimmed) || null;
  const priority = parsePriority(trimmed);

  let title = trimmed;
  const datePhrase = trimmed.match(/\b(today|tomorrow|\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{0,4}|\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi);
  const timePhrase = trimmed.match(/\b(\d{1,2}(?::\d{2})?\s*(am|pm)?)\b/gi);
  if (datePhrase) title = title.replace(datePhrase[0], "").trim();
  if (timePhrase) title = title.replace(timePhrase[0], "").trim();
  title = title.replace(/\b(remind me to|reminder|on|by|before|due|at)\b/gi, "").trim();
  if (!title) title = `Reminder ${date}${time ? " " + time : ""}`;

  return { title, date, time, priority };
}
