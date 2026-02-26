import { useNavigate, useLocation } from "react-router-dom";

export default function SidePanel() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { path: "/", label: "Home" },
    { path: "/reminders", label: "Reminders" },
    { path: "/todo", label: "To-Do" },
    { path: "/notes", label: "Notes" },
    { path: "/history", label: "History" },
  ];

  return (
    <div
      className="bg-dark text-white d-flex flex-column p-3"
      style={{ width: "200px", height: "100%" }}
    >
      <div
        className="fw-bold text-uppercase mb-3"
        style={{ color: "#bfc5ca", fontSize: "0.75rem" }}
      >
        Workspace
      </div>

      {links.map(({ path, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            className={`btn text-start mb-2 ${isActive ? "btn-secondary" : "btn-dark"}`}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
