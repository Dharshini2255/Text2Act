import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import SidePanel from "../components/SidePanel";
import { useTodos } from "../context/TodoContext";
import { useNavigate } from "react-router-dom";

function TodoLeftSidebar({ scope, setScope, searchQuery, setSearchQuery, selectedListId, setSelectedListId }) {
  const { lists, tags, addList, updateList, removeList, addTag, updateTag, removeTag, getTodosByScope, upcomingTodos } = useTodos();
  const [newListName, setNewListName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [showAddList, setShowAddList] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState("");
  const [editingTag, setEditingTag] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");

  const dayCount = getTodosByScope("day").length;
  const weekCount = getTodosByScope("weekly").length;
  const monthCount = getTodosByScope("monthly").length;

  return (
    <div
      className="d-flex flex-column bg-white rounded shadow-sm p-3"
      style={{ minWidth: "220px", height: "100%" }}
    >
      <div className="mb-3">
        <label className="form-label small text-muted mb-1">Q Search</label>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="small text-uppercase text-muted fw-bold mb-2">Tasks</div>
      <div className="d-flex flex-column gap-1 mb-3">
        <button
          className={`btn btn-sm text-start d-flex justify-content-between align-items-center ${scope === "upcoming" ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => setScope("upcoming")}
        >
          Upcoming <span className="badge bg-light text-dark">{upcomingTodos.length}</span>
        </button>
        <button
          className={`btn btn-sm text-start d-flex justify-content-between ${scope === "day" ? "btn-success" : "btn-outline-secondary"}`}
          onClick={() => setScope("day")}
        >
          Today <span className="badge bg-light text-dark">{dayCount}</span>
        </button>
        <button
          className={`btn btn-sm text-start d-flex justify-content-between ${scope === "weekly" ? "btn-info" : "btn-outline-secondary"}`}
          onClick={() => setScope("weekly")}
        >
          Weekly <span className="badge bg-light text-dark">{weekCount}</span>
        </button>
        <button
          className={`btn btn-sm text-start d-flex justify-content-between ${scope === "monthly" ? "btn-warning" : "btn-outline-secondary"}`}
          onClick={() => setScope("monthly")}
        >
          Monthly <span className="badge bg-light text-dark">{monthCount}</span>
        </button>
      </div>

      <div className="small text-uppercase text-muted fw-bold mb-2">Lists</div>
      <div className="d-flex flex-column gap-1 mb-3">
        {lists.map((list) => (
          <button
            key={list.id}
            className={`btn btn-sm text-start d-flex align-items-center gap-2 ${selectedListId === list.id ? "active" : ""}`}
            style={selectedListId === list.id ? { backgroundColor: list.color, color: "#fff" } : {}}
            onClick={() => setSelectedListId(selectedListId === list.id ? null : list.id)}
          >
            <span style={{ width: 12, height: 12, backgroundColor: list.color, borderRadius: 2 }} />
            {list.name}
          </button>
        ))}
        {showAddList ? (
          <div className="d-flex gap-1">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (addList({ name: newListName }), setNewListName(""), setShowAddList(false))}
            />
            <button className="btn btn-sm btn-outline-primary" onClick={() => (addList({ name: newListName }), setNewListName(""), setShowAddList(false))}>Add</button>
          </div>
        ) : (
          <button className="btn btn-sm btn-link text-secondary p-0" onClick={() => setShowAddList(true)}>+ Add New List</button>
        )}
      </div>

      <div className="small text-uppercase text-muted fw-bold mb-2">Tags</div>
      <div className="d-flex flex-wrap gap-1 mb-2 justify-content-center">
        {tags.map((tag) => (
          <span key={tag} className="badge bg-secondary">{tag}</span>
        ))}
        {showAddTag ? (
          <div className="d-flex gap-1">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (addTag(newTagName), setNewTagName(""), setShowAddTag(false))}
            />
            <button className="btn btn-sm btn-outline-secondary" onClick={() => (addTag(newTagName), setNewTagName(""), setShowAddTag(false))}>Add</button>
          </div>
        ) : (
          <button className="btn btn-sm btn-link text-secondary p-0" onClick={() => setShowAddTag(true)}>+ Add Tag</button>
        )}
      </div>
    </div>
  );
}

function TaskList({ tasks, selectedId, onSelect, onToggle, lists }) {
  return (
    <div className="d-flex flex-column gap-2">
      {tasks.length === 0 && <p className="text-muted">No tasks in this view. Add one above!</p>}
      {tasks.map((t) => {
        const list = lists.find((l) => l.id === t.listId);
        return (
          <div
            key={t.id}
            className={`d-flex align-items-center gap-2 p-3 rounded shadow-sm border ${selectedId === t.id ? "border-primary border-2" : ""}`}
            style={{ cursor: "pointer", backgroundColor: "#fff" }}
            onClick={() => onSelect(t)}
          >
            <input
              type="checkbox"
              className="form-check-input"
              checked={t.completed}
              onChange={(e) => { e.stopPropagation(); onToggle(t); }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-grow-1">
              <span style={{ textDecoration: t.completed ? "line-through" : "" }}>{t.title}</span>
              {t.dueDate && <small className="text-muted ms-2">{t.dueDate.slice(0, 10)}</small>}
              {t.subtasks?.length > 0 && <small className="text-muted ms-2">{t.subtasks.length} Subtasks</small>}
              {list && <span className="badge ms-2" style={{ backgroundColor: list.color }}>{list.name}</span>}
            </div>
            <span className="text-muted">›</span>
          </div>
        );
      })}
    </div>
  );
}

function TaskDetailPanel({ task, onClose, onUpdate, onDelete, lists, tags, addTag }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [listId, setListId] = useState(task?.listId ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 10) ?? "");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [taskTags, setTaskTags] = useState(task?.tags ?? []);

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? "");
      setDescription(task.description ?? "");
      setListId(task.listId ?? "");
      setDueDate(task.dueDate?.slice(0, 10) ?? "");
      setTaskTags(task.tags ?? []);
    }
  }, [task?.id, task?.title, task?.description, task?.listId, task?.dueDate, task?.tags]);

  if (!task) return null;

  const handleSave = () => {
    onUpdate(task.id, { title, description, listId: listId || null, dueDate: dueDate || null, tags: taskTags });
  };

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    const subs = [...(task.subtasks || []), { id: Date.now(), title: subtaskInput.trim(), completed: false }];
    onUpdate(task.id, { subtasks: subs });
    setSubtaskInput("");
  };

  const toggleSubtask = (subId) => {
    const subs = (task.subtasks || []).map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s));
    onUpdate(task.id, { subtasks: subs });
  };

  const removeTagFromTask = (tag) => setTaskTags((prev) => prev.filter((t) => t !== tag));
  const addTagToTask = (tag) => { if (tag && !taskTags.includes(tag)) setTaskTags((prev) => [...prev, tag]); };

  return (
    <div className="d-flex flex-column bg-white rounded shadow-sm p-3 h-100 overflow-auto">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Task: {task.title}</h6>
        <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>✕</button>
      </div>
      <div className="mb-3">
        <label className="form-label small">Title</label>
        <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label small">Description</label>
        <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label small">List</label>
        <select className="form-select form-select-sm" value={listId} onChange={(e) => setListId(e.target.value)}>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label small">Due date</label>
        <input type="date" className="form-control form-control-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label small">Tags</label>
        <div className="d-flex flex-wrap gap-1 mb-1">
          {taskTags.map((tag) => (
            <span key={tag} className="badge bg-secondary d-inline-flex align-items-center gap-1">
              {tag} <span style={{ cursor: "pointer" }} onClick={() => removeTagFromTask(tag)}>×</span>
            </span>
          ))}
          <select className="form-select form-select-sm" style={{ width: "auto" }} value="" onChange={(e) => { addTagToTask(e.target.value); e.target.value = ""; }}>
            <option value="">+ Add Tag</option>
            {tags.filter((t) => !taskTags.includes(t)).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label small">Subtasks</label>
        <div className="d-flex gap-1 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="+ Add New Subtask"
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubtask()}
          />
          <button className="btn btn-sm btn-outline-primary" onClick={addSubtask}>Add</button>
        </div>
        <ul className="list-unstyled small">
          {(task.subtasks || []).map((s) => (
            <li key={s.id} className="d-flex align-items-center gap-2 mb-1">
              <input type="checkbox" checked={s.completed} onChange={() => toggleSubtask(s.id)} />
              <span style={{ textDecoration: s.completed ? "line-through" : "" }}>{s.title}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto d-flex gap-2">
        <button className="btn btn-warning flex-grow-1" onClick={handleSave}>Save changes</button>
        <button className="btn btn-outline-secondary" onClick={() => onDelete(task.id)}>Delete Task</button>
      </div>
    </div>
  );
}

export default function TodoPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { todos, lists, tags, addTodo, updateTodo, removeTodo, getTodosByScope, upcomingTodos } = useTodos();
  const [scope, setScope] = useState("day");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const filtered = (() => {
    let list = scope === "upcoming" ? upcomingTodos : getTodosByScope(scope === "day" ? "day" : scope === "weekly" ? "weekly" : "monthly");
    if (selectedListId) list = list.filter((t) => t.listId === selectedListId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q));
    }
    return list;
  })();

  const selectedTask = selectedTaskId ? todos.find((t) => t.id === selectedTaskId) : null;
  const scopeLabel = scope === "upcoming" ? "Upcoming" : scope === "day" ? "Today" : scope === "weekly" ? "Weekly" : "Monthly";

  const handleToggleComplete = (task) => {
    updateTodo(task.id, { completed: !task.completed });
  };

  return (
    <>
      <TopBar pageTitle="To-Do List" onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearch={() => {}} />
      <div style={{ height: "calc(100vh - 56px)", overflow: "hidden", marginLeft: sidebarOpen ? 200 : 0 }}>
        {sidebarOpen && (
          <div style={{ position: "fixed", left: 0, top: 56, bottom: 0, width: 200, zIndex: 1050, overflowY: "auto" }}>
            <SidePanel />
          </div>
        )}
        <div className="container-fluid h-100">
        <div className="row h-100 g-0">
          <div className="col-auto p-2 bg-light overflow-auto" style={{ minWidth: 220 }}>
            <TodoLeftSidebar
              scope={scope}
              setScope={setScope}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedListId={selectedListId}
              setSelectedListId={setSelectedListId}
            />
          </div>
          <div className="col p-3 bg-light overflow-auto" style={{ minHeight: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">{scopeLabel} {filtered.length}</h5>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="+ Add New Task"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTaskTitle.trim()) {
                    const today = new Date().toISOString().slice(0, 10);
                    const scopeToUse = scope === "upcoming" ? "day" : scope;
                    addTodo({
                      title: newTaskTitle.trim(),
                      scope: scopeToUse,
                      dueDate: scopeToUse === "day" ? today : scopeToUse === "weekly" || scopeToUse === "monthly" ? today : null,
                      listId: selectedListId || lists[0]?.id,
                    });
                    setNewTaskTitle("");
                  }
                }}
              />
            </div>
            <TaskList
              tasks={filtered}
              selectedId={selectedTaskId}
              onSelect={(t) => setSelectedTaskId(t.id)}
              onToggle={handleToggleComplete}
              lists={lists}
            />
          </div>
          <div className="col-md-4 col-lg-3 p-2 bg-light">
            {selectedTask ? (
              <TaskDetailPanel
                task={selectedTask}
                onClose={() => setSelectedTaskId(null)}
                onUpdate={updateTodo}
                onDelete={(id) => { removeTodo(id); setSelectedTaskId(null); }}
                lists={lists}
                tags={tags}
                addTag={() => {}}
              />
            ) : (
              <div className="bg-white rounded shadow-sm p-4 text-center text-muted">
                <p className="mb-0">Select a task to view or edit details.</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
