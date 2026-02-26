import { useReminders } from "../context/ReminderContext";
import { useTodos } from "../context/TodoContext";
import { useNotes } from "../context/NotesContext";

export default function TileGrid({ searchQuery = "" }) {
  const { reminders } = useReminders();
  const { getTodosByScope, updateTodo } = useTodos();
  const { notes } = useNotes();
  const todaysTodos = getTodosByScope("day");

  // Normalize today date
  const today = new Date().toDateString();

  // Filter today's reminders (compare date string YYYY-MM-DD)
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todaysReminders = reminders.filter((r) => {
    try {
      const d = r.date && r.date.slice(0, 10);
      return d === todayDateStr;
    } catch {
      return false;
    }
  });

  // Dashboard tiles
  const tiles = [
    {
      title: "Reminders",
      color: "primary",
      content:
        todaysReminders.length === 0 ? (
          <p className="card-text text-muted mb-0">
            No reminders today
          </p>
        ) : (
          <ul className="list-unstyled mb-0">
            {todaysReminders.map((r) => (
              <li key={r.id} className="small">
                • {r.title}
                {r.time && <span className="text-muted ms-1">({r.time})</span>}
              </li>
            ))}
          </ul>
        ),
    },
    {
      title: "To-Do",
      color: "success",
      content:
        todaysTodos.length === 0 ? (
          <p className="card-text text-muted mb-0">No tasks today</p>
        ) : (
          <div className="d-flex flex-column gap-1 mb-0">
            {todaysTodos.slice(0, 5).map((t) => (
              <div key={t.id} className="d-flex align-items-center gap-2 small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={t.completed}
                  onChange={() => updateTodo(t.id, { completed: !t.completed })}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ textDecoration: t.completed ? "line-through" : "" }}>{t.title}</span>
              </div>
            ))}
            {todaysTodos.length > 5 && <span className="small text-muted">+{todaysTodos.length - 5} more</span>}
          </div>
        ),
    },
    {
      title: "Notes",
      color: "secondary",
      content:
        notes.length === 0 ? (
          <p className="card-text text-muted mb-0">No notes generated</p>
        ) : (
          <ul className="list-unstyled mb-0 small">
            {notes.slice(0, 3).map((n) => (
              <li key={n.id}>• {n.title?.slice(0, 30)}{n.title?.length > 30 ? "…" : ""}</li>
            ))}
            {notes.length > 3 && <li className="text-muted">+{notes.length - 3} more</li>}
          </ul>
        ),
    },
    {
      title: "Documents",
      color: "warning",
      content: (
        <p className="card-text text-muted mb-0">
          Upload documents to begin
        </p>
      ),
    },
    {
      title: "History",
      color: "dark",
      content: (
        <p className="card-text text-muted mb-0">
          No activity yet
        </p>
      ),
    },
  ];

  // Apply search filter
  const filteredTiles = tiles.filter((tile) =>
    tile.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="row g-4">
      {filteredTiles.length === 0 && (
        <p className="text-muted">No matching sections</p>
      )}

      {filteredTiles.map((tile, index) => (
        <div className="col-md-4" key={index}>
          <div
            className={`card border-${tile.color} h-100`}
            style={{
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.02)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <div className={`card-header bg-${tile.color} text-white`}>
              {tile.title}
            </div>

            <div className="card-body">
              {tile.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
