import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchCompletedTasks } from '../services/api';
import TaskCard from './TaskCard';

const CompletedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const location = useLocation();

  const loadTasks = async () => {
    try {
      const data = await fetchCompletedTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [location]);

  return (
    <>
      <div className="page-header">
        <h2>✅ Completed Tasks</h2>
      </div>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No completed tasks</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onUpdate={loadTasks} />
          ))
        )}
      </div>
    </>
  );
};

export default CompletedTasks;

