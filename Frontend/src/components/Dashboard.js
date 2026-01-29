import React, { useEffect, useState, useCallback, useMemo } from "react";
import { fetchTasks } from "../services/api";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import DeleteTaskModal from "./DeleteTaskModal";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // For accurate stats
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(null); // track which page is currently loading
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const tasksPerPage = 5;

  const loadFilteredTasks = useCallback(async (page = 1) => {
    const p = Number(page) || 1;
    // Clamp page between 1 and totalPages
    const clampedPage = Math.max(1, Math.min(p, Number(totalPages) || 1));
    
    // Skip if already loading this exact page
    if (loadingPage === clampedPage) return;

    try {
      setLoading(true);
      setLoadingPage(clampedPage);
      const response = await fetchTasks({
        limit: tasksPerPage,
        page: clampedPage,
        search: debouncedSearch,
        status: statusFilter,
        date: dateFilter
      });

      // Ensure response has expected structure
      const tasksArray = Array.isArray(response) ? response : (response?.tasks || []);
      const totalTasks = response?.totalTasks || tasksArray.length || 0;
      const totalPages = response?.totalPages || 1;
      const currentPageFromResponse = response?.currentPage || clampedPage;

      setTasks(tasksArray);
      setTotalTasks(totalTasks);
      setTotalPages(totalPages);
      setCurrentPage(Number(currentPageFromResponse));
    } catch (err) {
      console.error("Error loading tasks for page", page, ":", err);
      setTasks([]);
    } finally {
      setLoading(false);
      setLoadingPage(null);
    }
  }, [loadingPage, debouncedSearch, statusFilter, dateFilter, tasksPerPage, totalPages]);

  const loadAllTasksForStats = useCallback(async () => {
    if (statsLoaded) return; // Only load stats once

    try {
      // Load minimal data for stats - just get counts from server
      const statsData = await fetchTasks({ limit: 1, page: 1 }); // Just get pagination info
      // For now, we'll still load all tasks but optimize this later
      const allTasksData = await fetchTasks({ limit: 10000 });
      setAllTasks(allTasksData.tasks || allTasksData);
      setStatsLoaded(true);
    } catch (err) {
      console.error("All tasks load error:", err);
    }
  }, [statsLoaded]);

  const handleTaskUpdate = useCallback(async () => {
    setStatsLoaded(false); // Reset stats cache
    await Promise.all([
      loadFilteredTasks(currentPage),
      loadAllTasksForStats()
    ]);
  }, [loadFilteredTasks, loadAllTasksForStats, currentPage]);

  // Debounce search input to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadAllTasksForStats(); // Load stats once on mount
  }, [loadAllTasksForStats]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    loadFilteredTasks(1);
  }, [debouncedSearch, statusFilter, dateFilter, loadFilteredTasks]);

  // Stats calculation - memoized to prevent unnecessary recalculations
  const stats = useMemo(() => {
    if (!Array.isArray(allTasks)) return { pending: 0, completed: 0 };
    return {
      pending: allTasks.filter(t => t.status === "pending").length,
      completed: allTasks.filter(t => t.status === "completed").length
    };
  }, [allTasks]);

  const pending = stats.pending;
  const completed = stats.completed;

  const handleEditClick = () => {
    if (selectedTask) {
      setIsEditModalOpen(true);
    } else {
      alert("Please select a task from the list to edit.");
    }
  };

  const handleDeleteClick = () => {
    if (selectedTask) {
      setIsDeleteModalOpen(true);
    } else {
      alert("Please select a task from the list to delete.");
    }
  };

  // Helper to change pages with bounds checking
  const handlePreviousPage = () => {
    const newPage = Math.max(1, Number(currentPage) - 1);
    if (newPage !== Number(currentPage)) {
      setCurrentPage(newPage);
      loadFilteredTasks(newPage);
    }
  };

  const handleNextPage = () => {
    const newPage = Math.min(Number(totalPages) || 1, Number(currentPage) + 1);
    if (newPage !== Number(currentPage)) {
      setCurrentPage(newPage);
      loadFilteredTasks(newPage);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <div className="header-buttons">
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            ➕ Add Task
          </button>
          <button className="btn-edit" onClick={handleEditClick}>
            ✏️ Edit Task
          </button>
          <button className="btn-delete" onClick={handleDeleteClick}>
            🗑️ Delete Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">📋 Total <span>{allTasks.length}</span></div>
        <div className="stat-card">⏳ Pending <span>{pending}</span></div>
        <div className="stat-card">✅ Completed <span>{completed}</span></div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-filter">Date:</label>
            <input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            />
          </div>

          <div className="filter-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setDateFilter("");
              }}
              disabled={!search && !statusFilter && !dateFilter}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading && <div className="loading-indicator">Loading tasks...</div>}
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Recent Activity - All Tasks */}
      <h3 className="section-title">🕒 Recent Activity</h3>
      <div className="tasks-list">
        {tasks.length === 0 ? (
          <p className="empty-state">No tasks found</p>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdate={handleTaskUpdate}
              isSelected={selectedTask?.id === task.id}
              onSelect={() => setSelectedTask(task)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {Number(totalPages) > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={handlePreviousPage}
            disabled={Number(currentPage) === 1 || loading}
            aria-label="Previous page"
          >
            ‹ Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalTasks} total tasks)
          </span>
          
          <button 
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={Number(currentPage) === Number(totalPages) || loading}
            aria-label="Next page"
          >
            Next ›
          </button>
        </div>
      )}

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTaskAdded={handleTaskUpdate}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTaskUpdated={handleTaskUpdate}
        task={selectedTask}
        allTasks={allTasks}
      />

      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onTaskDeleted={handleTaskUpdate}
        task={selectedTask}
        allTasks={allTasks}
      />
    </>
  );
};

export default Dashboard;
