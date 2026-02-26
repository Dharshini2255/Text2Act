export function extractTitle(text, intent) {
  let cleaned = text.toLowerCase();

  // ---------- COMMON CLEANUP ----------
  cleaned = cleaned.replace(
    /\b(my|me|please|kindly|don't forget to|remember to|add|set|create)\b/g,
    ""
  );

  // ---------- REMINDER ----------
  if (intent === "REMINDER") {
    cleaned = cleaned.replace(
      /\b(on|at|by|before|after|tomorrow|today|\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
      ""
    );
  }

  // ---------- TODO ----------
  if (intent === "TODO") {
    cleaned = cleaned.replace(
      /\b(to the to do list|to do list|task|todo|list)\b/g,
      ""
    );
  }

  // ---------- FINAL CLEAN ----------
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}