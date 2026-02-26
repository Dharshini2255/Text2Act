import { useState, useRef } from "react";
import TopBar from "../components/TopBar";
import SidePanel from "../components/SidePanel";
import { useNotes } from "../context/NotesContext";
import { generateKeyPointsFromText } from "../utils/notesGenerator";

function CreateNoteChoice({ onWritePrompt, onUploadOrPaste }) {
  return (
    <div className="row g-4 justify-content-center py-5">
      <div className="col-md-5">
        <div
          className="card border-0 shadow-sm h-100 p-4 rounded-3"
          style={{ cursor: "pointer", transition: "transform 0.2s", backgroundColor: "#e8f4fd" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={onWritePrompt}
        >
          <div className="text-center mb-3">
            <span className="display-4">⌨️</span>
          </div>
          <h5 className="text-center">Write a prompt</h5>
          <p className="text-muted text-center small mb-0">
            Describe what you want your notes to be about
          </p>
        </div>
      </div>
      <div className="col-md-5">
        <div
          className="card border-0 shadow-sm h-100 p-4 rounded-3"
          style={{ cursor: "pointer", transition: "transform 0.2s", backgroundColor: "#fce8f0" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={onUploadOrPaste}
        >
          <div className="text-center mb-3">
            <span className="display-4">📄</span>
          </div>
          <h5 className="text-center">Upload or paste content</h5>
          <p className="text-muted text-center small mb-0">
            Upload your existing content and allow AI to summarize it
          </p>
        </div>
      </div>
    </div>
  );
}

function downloadAsText(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAsHtml(content, title, filename) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1><pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "note.html";
  a.click();
  URL.revokeObjectURL(url);
}

function NoteCard({ note, onSelect, onDelete, onDownload }) {
  const typeLabels = { uploaded: "Document", generated_notes: "Notes", key_points: "Key points", diagram: "Diagram", flashcard: "Flashcard" };
  const typeColors = { uploaded: "primary", generated_notes: "success", key_points: "info", diagram: "warning", flashcard: "secondary" };

  return (
    <div
      className="card shadow-sm mb-3 rounded-3 border-0 overflow-hidden"
      style={{ cursor: "pointer" }}
      onClick={() => onSelect(note)}
    >
      <div className={`card-header bg-${typeColors[note.type] || "secondary"} text-white py-2 d-flex justify-content-between align-items-center`}>
        <span className="small fw-bold">{typeLabels[note.type] || note.type}</span>
        <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-sm btn-light" title="Download" onClick={() => onDownload(note)}>⬇</button>
          <button className="btn btn-sm btn-light text-danger" title="Delete" onClick={() => onDelete(note.id)}>✕</button>
        </div>
      </div>
      <div className="card-body py-2">
        <h6 className="card-title mb-1">{note.title}</h6>
        <p className="card-text small text-muted mb-0">
          {note.content?.slice(0, 100) || (note.keyPoints?.length ? note.keyPoints.length + " key points" : "")}…
        </p>
      </div>
    </div>
  );
}

function NoteDetailPanel({ note, onClose, onDownload }) {
  if (!note) return null;
  return (
    <div className="bg-white rounded-3 shadow-sm p-4 h-100 overflow-auto">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{note.title}</h5>
        <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>✕</button>
      </div>
      {note.keyPoints?.length > 0 && (
        <div className="mb-3">
          <h6 className="text-muted">Key points</h6>
          <ul className="list-unstyled">
            {note.keyPoints.map((p, i) => (
              <li key={i} className="mb-2">• {p}</li>
            ))}
          </ul>
        </div>
      )}
      {note.content && (
        <div className="mb-3">
          <h6 className="text-muted">Content</h6>
          <pre className="bg-light p-3 rounded small" style={{ whiteSpace: "pre-wrap" }}>{note.content}</pre>
        </div>
      )}
      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-outline-primary btn-sm" onClick={() => onDownload(note, "txt")}>Download as TXT</button>
        <button className="btn btn-outline-primary btn-sm" onClick={() => onDownload(note, "html")}>Download as HTML (open in Word)</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState("choice");
  const [prompt, setPrompt] = useState("");
  const [pastedContent, setPastedContent] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const fileInputRef = useRef(null);
  const { notes, addNote, removeNote } = useNotes();

  const handleWritePrompt = () => {
    setMode("prompt");
  };

  const handleUploadOrPaste = () => {
    setMode("upload");
  };

  const handleSubmitPrompt = () => {
    if (!prompt.trim()) return;
    const keyPoints = generateKeyPointsFromText(prompt, 6);
    addNote({
      title: "Note: " + prompt.slice(0, 40) + (prompt.length > 40 ? "…" : ""),
      content: prompt,
      type: "generated_notes",
      keyPoints: keyPoints.length ? keyPoints : [prompt],
    });
    setPrompt("");
    setMode("choice");
  };

  const handlePasteSubmit = () => {
    if (!pastedContent.trim()) return;
    const keyPoints = generateKeyPointsFromText(pastedContent, 8);
    addNote({
      title: "Key points from content",
      content: pastedContent,
      type: "key_points",
      keyPoints,
    });
    setPastedContent("");
    setMode("choice");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      const keyPoints = generateKeyPointsFromText(content, 8);
      addNote({
        title: file.name,
        content,
        type: "uploaded",
        keyPoints,
        sourceDocument: file.name,
      });
      setMode("choice");
    };
    if (file.type === "text/plain") reader.readAsText(file);
    else reader.readAsText(file, "utf-8");
  };

  const handleDownload = (note, format) => {
    const title = note.title || "Note";
    const body = note.keyPoints?.length ? note.keyPoints.join("\n\n") : note.content || "";
    const filename = (title.replace(/\s+/g, "_") + "." + (format === "html" ? "html" : "txt")).slice(0, 80);
    if (format === "html") downloadAsHtml(body, title, filename);
    else downloadAsText(body, filename);
  };

  return (
    <>
      <TopBar pageTitle="Notes" onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearch={() => {}} />
      <div style={{ height: "calc(100vh - 56px)", overflow: "hidden", marginLeft: sidebarOpen ? 200 : 0 }}>
        {sidebarOpen && (
          <div style={{ position: "fixed", left: 0, top: 56, bottom: 0, width: 200, zIndex: 1050, overflowY: "auto" }}>
            <SidePanel />
          </div>
        )}
        <div className="container-fluid h-100">
        <div className="row h-100 g-0">
          <div className="col p-4 bg-light overflow-auto">
            {mode === "choice" && (
              <>
                <div className="text-center mb-4">
                  <h4 className="mb-2">How would you like to create your note?</h4>
                </div>
                <CreateNoteChoice onWritePrompt={handleWritePrompt} onUploadOrPaste={handleUploadOrPaste} />
              </>
            )}
            {(mode === "prompt" || mode === "upload") && (
              <div className="card shadow-sm rounded-3 border-0 p-4 mb-4">
                {mode === "prompt" && (
                  <>
                    <label className="form-label">Describe your note</label>
                    <textarea
                      className="form-control mb-2"
                      rows={4}
                      placeholder="e.g. Summary of heart valves and blood flow"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleSubmitPrompt}>Generate note</button>
                  </>
                )}
                {mode === "upload" && (
                  <>
                    <label className="form-label">Paste content or upload file</label>
                    <textarea
                      className="form-control mb-2"
                      rows={6}
                      placeholder="Paste your content here..."
                      value={pastedContent}
                      onChange={(e) => setPastedContent(e.target.value)}
                    />
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <button className="btn btn-primary" onClick={handlePasteSubmit}>Generate key points</button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept=".txt,.pdf"
                        onChange={handleFileUpload}
                      />
                      <button className="btn btn-outline-secondary" onClick={() => fileInputRef.current?.click()}>Upload file</button>
                    </div>
                  </>
                )}
              </div>
            )}

            <h5 className="mb-3">Your notes & documents</h5>
            <div className="row">
              {notes.map((note) => (
                <div key={note.id} className="col-md-6 col-lg-4">
                  <NoteCard
                    note={note}
                    onSelect={setSelectedNote}
                    onDelete={removeNote}
                    onDownload={handleDownload}
                  />
                </div>
              ))}
              {notes.length === 0 && <p className="text-muted">No notes yet. Create one above.</p>}
            </div>
          </div>
          <div className="col-md-6 p-3 bg-white border-start overflow-auto">
            {selectedNote ? (
              <NoteDetailPanel note={selectedNote} onClose={() => setSelectedNote(null)} onDownload={handleDownload} />
            ) : (
              <div className="text-center text-muted py-4">
                <p>Select a note to view details and download (PDF/Word via HTML or TXT).</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
