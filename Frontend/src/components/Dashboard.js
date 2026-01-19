import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchTasks, fetchRecentTasks } from '../services/api';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const loadData = async () => {
    try {
      const [allTasks, recent] = await Promise.all([
        fetchTasks(),
        fetchRecentTasks(),
      ]);
      setTasks(allTasks);
      setRecentTasks(recent);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [location]);

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <>
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          ➕ Add New Task
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>📋 Total Tasks</h3>
          <p className="stat-number">{tasks.length}</p>
        </div>
        <div className="stat-card">
          <h3>⏳ Pending</h3>
          <p className="stat-number">{pendingCount}</p>
        </div>
        <div className="stat-card">
          <h3>✅ Completed</h3>
          <p className="stat-number">{completedCount}</p>
        </div>
      </div>

      <div className="section">
        <h3>🕐 Recent Tasks</h3>
        <div className="tasks-list">
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <p>No recent tasks</p>
            </div>
          ) : (
            recentTasks.slice(0, 5).map(task => (
              <TaskCard key={task.id} task={task} onUpdate={loadData} />
            ))
          )}
        </div>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskAdded={loadData}
      />
    </>
  );
};

export default Dashboard;

