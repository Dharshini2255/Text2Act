import { useHistory } from "../context/HistoryContext";

export default function RightPanel() {
  const { lastDetected } = useHistory();

  if (!lastDetected) {
    return (
      <div className="p-3">
        <h6 className="text-muted">Identified items</h6>
        <hr />
        <p className="text-muted small">
          Type a message or upload a document to see detected actions here.
        </p>
      </div>
    );
  }

  const { reminders = [], todos = [], notes = [], document: doc } = lastDetected;

  return (
    <div className="p-3">
      <h6 className="text-muted mb-3">Identified items</h6>
      <hr />

      {reminders.length > 0 && (
        <div className="mb-3">
          <p className="fw-bold text-primary small mb-1">Reminders found</p>
          <ul className="list-unstyled small mb-0">
            {reminders.map((r, i) => (
              <li key={i}>• {r.title} {r.date && `(${r.date})`}</li>
            ))}
          </ul>
        </div>
      )}

      {todos.length > 0 && (
        <div className="mb-3">
          <p className="fw-bold text-success small mb-1">To-do list actions found</p>
          <ul className="list-unstyled small mb-0">
            {todos.map((t, i) => (
              <li key={i}>• {typeof t === "string" ? t : t.title || t.task}</li>
            ))}
          </ul>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mb-3">
          <p className="fw-bold text-info small mb-1">Notes found</p>
          <ul className="list-unstyled small mb-0">
            {notes.map((n, i) => (
              <li key={i}>• {typeof n === "string" ? n.slice(0, 50) : n.title || "Note"}</li>
            ))}
          </ul>
        </div>
      )}

      {doc && (
        <div className="mb-3">
          <p className="fw-bold text-warning small mb-1">Document</p>
          <p className="small text-muted mb-0">{doc.source || "Document"} – content received</p>
        </div>
      )}

      {!reminders.length && !todos.length && !notes.length && !doc && lastDetected.type && (
        <div className="mb-3">
          <p className="fw-bold text-secondary small mb-1">Last action</p>
          <p className="small mb-0">{lastDetected.summary || lastDetected.type}</p>
        </div>
      )}
    </div>
  );
}
