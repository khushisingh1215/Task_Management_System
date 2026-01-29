import React, { useState, useEffect, useCallback } from 'react';
import { fetchRecentTasks } from '../services/api';
import TaskCard from './TaskCard';

const RecentActivity = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);

  const loadTasks = useCallback(async () => {
    // Prevent rapid successive calls
    const now = Date.now();
    if (now - lastUpdate < 2000) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecentTasks();
      // Ensure data is an array
      setTasks(Array.isArray(data) ? data : []);
      setLastUpdate(now);
    } catch (error) {
      console.error('Error loading recent tasks:', error);
      setError('Failed to load recent tasks');
    } finally {
      setLoading(false);
    }
  }, [lastUpdate]);

  useEffect(() => {
    loadTasks();
    // Poll every 10 minutes for extreme backend load reduction - stale-while-revalidate handles freshness
    const interval = setInterval(loadTasks, 300000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  return (
    <>
      <div className="page-header">
        <h2>🕐 Recent Activity</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-list">
        {loading && tasks.length === 0 ? (
          <div className="loading-state">Loading recent activity...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No recent activity</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdate={() => {
                setLastUpdate(0); // Reset to allow immediate reload
                loadTasks();
              }} 
            />
          ))
        )}
      </div>
    </>
  );
};

export default RecentActivity;

