import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchPendingTasks } from '../services/api';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';

const PendingTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const loadTasks = async () => {
    try {
      const data = await fetchPendingTasks();
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
        <h2>⏳ Pending Tasks</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          ➕ Add New Task
        </button>
      </div>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No pending tasks</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onUpdate={loadTasks} />
          ))
        )}
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskAdded={loadTasks}
      />
    </>
  );
};

export default PendingTasks;

