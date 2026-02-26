import * as XLSX from "xlsx";

/**
 * Parse Excel file and extract reminders (top priority)
 * @param {File} file - uploaded Excel file
 * @returns {Promise<Array>} list of reminder objects
 */
export function parseExcelForReminders(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: false,
        });

        const reminders = extractBirthdayReminders(rows, sheetName);
        resolve(reminders);
      } catch (error) {
        console.error("Excel parsing error:", error);
        reject(error);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

/* ----------------------------------------------------
   Core Logic: Detect & Extract Birthday Reminders
---------------------------------------------------- */

function extractBirthdayReminders(rows, sheetName) {
  const reminders = [];
  if (!rows || !rows.length) return reminders;

  // Detect table context (birthday / date-based)
  const headers = Object.keys(rows[0]).map((h) => h.toLowerCase());
  const isBirthdayTable =
    sheetName.toLowerCase().includes("birthday") ||
    headers.some((h) =>
      ["dob", "date", "birth", "birthday"].includes(h)
    );

  if (!isBirthdayTable) return reminders;

  rows.forEach((row) => {
    const name =
      row.name ||
      row.names ||
      row.person ||
      row.Name ||
      row.Names ||
      "";

    const date =
      row.date ||
      row.dob ||
      row.Date ||
      row.DOB ||
      "";

    if (!name || !date) return;

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) return;

    reminders.push({
      title: `${capitalize(name)}'s birthday`,
      date: normalizedDate,       // MM-DD
      recurring: "yearly",
      priority: "medium",
      source: "excel",
    });
  });

  return reminders;
}

/* ----------------------------------------------------
   Helpers
---------------------------------------------------- */

/**
 * Normalize date to MM-DD (ignore year for birthdays)
 */
function normalizeDate(value) {
  // Excel Date object
  if (value instanceof Date) {
    return value.toISOString().slice(5, 10);
  }

  // String dates (dd-mm-yyyy or dd/mm/yyyy)
  const parts = value.toString().split(/[-/]/);
  if (parts.length < 2) return null;

  let day = parts[0];
  let month = parts[1];

  if (!isValidNumber(day) || !isValidNumber(month)) return null;

  return `${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Capitalize name properly
 */
function capitalize(text) {
  const cleaned = text.toString().trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Validate numeric string
 */
function isValidNumber(value) {
  return /^\d+$/.test(value);
}
