import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ReminderProvider } from "./context/ReminderContext";
import { TodoProvider } from "./context/TodoContext";
import { NotesProvider } from "./context/NotesContext";
import { HistoryProvider } from "./context/HistoryContext";
import "./styles/calendar.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HistoryProvider>
      <ReminderProvider>
        <TodoProvider>
          <NotesProvider>
            <App />
          </NotesProvider>
        </TodoProvider>
      </ReminderProvider>
    </HistoryProvider>
  </React.StrictMode>
);
