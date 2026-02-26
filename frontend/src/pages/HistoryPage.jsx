import TopBar from "../components/TopBar";
import SidePanel from "../components/SidePanel";
import { useHistory } from "../context/HistoryContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { history, clearHistory } = useHistory();

  const typeLabels = {
    reminder: "Reminder",
    todo: "To-Do",
    note: "Notes",
    document: "Document",
    action: "Action",
  };
  const typeColors = {
    reminder: "primary",
    todo: "success",
    note: "info",
    document: "warning",
    action: "secondary",
  };

  return (
    <>
      <TopBar pageTitle="History" onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearch={() => {}} />
      <div style={{ height: "calc(100vh - 56px)", overflow: "hidden", marginLeft: sidebarOpen ? 200 : 0 }}>
        {sidebarOpen && (
          <div style={{ position: "fixed", left: 0, top: 56, bottom: 0, width: 200, zIndex: 1050, overflowY: "auto" }}>
            <SidePanel />
          </div>
        )}
        <div className="container-fluid h-100 overflow-auto">
          <div className="row g-0">
          <div className="col p-4 bg-light overflow-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">User actions history</h4>
              {history.length > 0 && (
                <button className="btn btn-outline-secondary btn-sm" onClick={clearHistory}>
                  Clear history
                </button>
              )}
            </div>
            {history.length === 0 && (
              <div className="card shadow-sm rounded-3 border-0 p-5 text-center text-muted">
                <p className="mb-0">No activity yet. Use the chat or upload documents to see actions here.</p>
              </div>
            )}
            <div className="d-flex flex-column gap-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className={`card shadow-sm rounded-3 border-0 border-start border-4 border-${typeColors[item.type] || "secondary"}`}
                  style={{ cursor: item.payload?.path ? "pointer" : "default" }}
                  onClick={() => item.payload?.path && navigate(item.payload.path)}
                  onKeyDown={(e) => e.key === "Enter" && item.payload?.path && navigate(item.payload.path)}
                >
                  <div className="card-body py-3 d-flex justify-content-between align-items-start">
                    <div>
                      <span className={`badge bg-${typeColors[item.type] || "secondary"} me-2`}>
                        {typeLabels[item.type] || item.type}
                      </span>
                      <span className="text-muted small">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <p className="mb-0 mt-1">{item.summary || (item.payload && typeof item.payload === "object" ? JSON.stringify(item.payload).slice(0, 80) : "")}</p>
                      {item.payload?.path && <small className="text-muted">Click to go to page</small>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
