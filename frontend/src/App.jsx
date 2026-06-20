import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

// API Base Endpoint
const API_BASE_URL = "http://localhost:5000/api/tasks";

// Custom SVG Icons for modern visual design
const SearchIcon = () => (
  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const AddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

function App() {
  // Task State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  // Toast Generator
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  // Fetch Tasks from API
  const fetchTasks = useCallback(async (search = "", status = "all") => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (search.trim() !== "") params.search = search;
      if (status !== "all") params.status = status;

      const response = await axios.get(API_BASE_URL, { params });
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      const msg = err.response?.data?.message || "Failed to load tasks. Ensure backend is running.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Debounced Search logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTasks(searchQuery, statusFilter);
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, statusFilter, fetchTasks]);

  // Handle Toggle Task Status (Completed / Pending)
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      // Optimistic state update for fluid UX micro-interaction
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );

      const response = await axios.patch(`${API_BASE_URL}/${task._id}/status`, {
        status: newStatus,
      });

      showToast(
        `Task "${task.title}" marked as ${newStatus}`,
        newStatus === "completed" ? "success" : "info"
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      // Revert optimistic update on fail
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t))
      );
      showToast(err.response?.data?.message || "Failed to update task status", "error");
    }
  };

  // Delete Task
  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the task "${title}"?`)) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      showToast(`Task "${title}" deleted successfully`, "success");
    } catch (err) {
      console.error("Deletion error:", err);
      showToast(err.response?.data?.message || "Failed to delete task", "error");
    }
  };

  // Open Modal for Creation
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setShowModal(true);
  };

  // Open Modal for Editing
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setShowModal(true);
  };

  // Submit Task (Create or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (formTitle.trim() === "") {
      showToast("Task title is required", "error");
      return;
    }

    try {
      if (editingTask) {
        // Update task request
        const response = await axios.put(`${API_BASE_URL}/${editingTask._id}`, {
          title: formTitle,
          description: formDescription,
        });
        
        showToast("Task updated successfully", "success");
      } else {
        // Create task request
        const response = await axios.post(API_BASE_URL, {
          title: formTitle,
          description: formDescription,
        });

        showToast("Task created successfully", "success");
      }

      setShowModal(false);
      fetchTasks(searchQuery, statusFilter);
    } catch (err) {
      console.error("Form submit error:", err);
      showToast(err.response?.data?.message || "Failed to save task", "error");
    }
  };

  // Close toast message manually
  const closeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Calculate Real-time Statistics based on full task state
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <h1>TaskFlow</h1>
          <p>Organize your goals, clear your mind, get things done.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreateModal}>
          <AddIcon /> New Task
        </button>
      </header>

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Tasks</span>
          <span className="stat-value">{totalCount}</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{completedCount}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
      </section>

      {/* Control bar */}
      <section className="controls-row">
        <div className="search-filter-group">
          <div className="search-wrapper">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search tasks by title or desc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </section>

      {/* Error Bar */}
      {error && (
        <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#ef4444" }}>
          ⚠️ {error}. Click "New Task" or refresh once the backend API is online.
        </div>
      )}

      {/* Tasks Grid or Loading states */}
      <main className="tasks-grid">
        {loading ? (
          // Skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton-card shimmer-card"></div>
          ))
        ) : tasks.length === 0 ? (
          <div className="empty-state animate-fade">
            <ClipboardIcon />
            <h3>No Tasks Found</h3>
            <p>Write your first task to start organizing your workflow.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <article
              key={task._id}
              className={`task-card animate-fade ${
                task.status === "completed" ? "completed-card" : ""
              }`}
            >
              <div className="task-card-header">
                <button
                  className={`check-btn ${task.status === "completed" ? "checked" : ""}`}
                  onClick={() => handleToggleStatus(task)}
                  aria-label="Toggle task status"
                >
                  {task.status === "completed" && (
                    <svg width="12" height="12" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>

                <div className="task-title-area">
                  <h3 className="task-title">{task.title}</h3>
                  <span className={`status-badge ${task.status}`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-card-footer">
                <span className="task-date">
                  {new Date(task.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <div className="action-buttons">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleOpenEditModal(task)}
                    title="Edit Task"
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDeleteTask(task._id, task.title)}
                    title="Delete Task"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Task Creation/Editing Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade">
            <div className="modal-header">
              <h2>{editingTask ? "Edit Task" : "Add New Task"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label htmlFor="task-title">Title *</label>
                <input
                  type="text"
                  id="task-title"
                  placeholder="What needs to be done?"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-desc">Description</label>
                <textarea
                  id="task-desc"
                  placeholder="Enter extra details (optional)..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="form-input form-textarea"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => closeToast(toast.id)}>
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
