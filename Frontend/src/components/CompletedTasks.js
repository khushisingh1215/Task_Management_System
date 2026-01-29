import React, { useState, useEffect, useCallback } from 'react';
import { fetchCompletedTasks } from '../services/api';
import TaskCard from './TaskCard';

const CompletedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tasksPerPage = 5;
  const lastLoadRef = React.useRef(0);

  const loadTasks = useCallback(async (page = 1) => {
    const p = Number(page) || 1;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchCompletedTasks(p, tasksPerPage);
      if (data && typeof data === 'object' && 'tasks' in data) {
        // Paginated response
        setTasks(data.tasks || []);
        setTotalTasks(data.totalTasks || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(Number(data.currentPage) || p);
      } else {
        // Fallback for non-paginated response
        setTasks(Array.isArray(data) ? data : []);
        setTotalTasks(Array.isArray(data) ? data.length : 0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load completed tasks');
    } finally {
      setLoading(false);
    }
  }, [tasksPerPage]);

  useEffect(() => {
    loadTasks(1);
  }, [loadTasks]);

  const handlePageChange = (newPage) => {
    const p = Math.max(1, Math.min(Number(newPage) || 1, Number(totalPages) || 1));
    if (p !== Number(currentPage)) {
      setCurrentPage(p);
      loadTasks(p);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>✅ Completed Tasks</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-list">
        {loading && tasks.length === 0 ? (
          <div className="loading-state">Loading completed tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No completed tasks</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdate={() => {
                lastLoadRef.current = 0; // Reset to allow immediate reload
                loadTasks(currentPage);
              }} 
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {Number(totalPages) > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(Number(currentPage) - 1)}
            disabled={Number(currentPage) === 1 || loading}
            aria-label="Previous page"
          >
            ‹ Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalTasks} total completed tasks)
          </span>
          
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(Number(currentPage) + 1)}
            disabled={Number(currentPage) === Number(totalPages) || loading}
            aria-label="Next page"
          >
            Next ›
          </button>
        </div>
      )}
    </>
  );
};

export default CompletedTasks;

