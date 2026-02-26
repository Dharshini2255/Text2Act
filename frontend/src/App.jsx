import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RemindersPage from "./pages/RemindersPage";
import TodoPage from "./pages/TodoPage";
import NotesPage from "./pages/NotesPage";
import HistoryPage from "./pages/HistoryPage";
import AlarmManager from "./components/AlarmManager";
import ChatBox from "./components/ChatBox";
import ClearDetectedOnNavigate from "./components/ClearDetectedOnNavigate";

function App() {
  return (
    <BrowserRouter>
      <ClearDetectedOnNavigate />
      <AlarmManager />
      <ChatBox />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/todo" element={<TodoPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
