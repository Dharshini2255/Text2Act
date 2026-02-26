/**
 * Generate key points / summary from text (for notes).
 * Used when user uploads document and asks for notes or key points.
 */
export function generateKeyPointsFromText(text, maxPoints = 8) {
  if (!text || typeof text !== "string") return [];
  const trimmed = text.trim();
  if (!trimmed.length) return [];

  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) {
    const lines = trimmed.split(/\n/).map((s) => s.trim()).filter(Boolean);
    return lines.slice(0, maxPoints);
  }

  const keyPoints = [];
  const step = Math.max(1, Math.floor(sentences.length / maxPoints));
  for (let i = 0; i < sentences.length && keyPoints.length < maxPoints; i += step) {
    keyPoints.push(sentences[i]);
  }
  return keyPoints.slice(0, maxPoints);
}

export function generateNotesSummary(text, withKeyPoints = true) {
  const keyPoints = withKeyPoints ? generateKeyPointsFromText(text) : [];
  const summary = text.length > 300 ? text.slice(0, 300) + "…" : text;
  return { summary, keyPoints };
}
