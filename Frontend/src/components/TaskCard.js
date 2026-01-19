import React from 'react';
import { updateTask, deleteTask } from '../services/api';

const TaskCard = ({ task, onUpdate }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMarkComplete = async () => {
    try {
      await updateTask(task.id, task.title, task.description, 'completed');
      onUpdate();
    } catch (error) {
      alert('Error updating task');
    }
  };

  const handleMarkPending = async () => {
    try {
      await updateTask(task.id, task.title, task.description, 'pending');
      onUpdate();
    } catch (error) {
      alert('Error updating task');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(task.id);
      onUpdate();
    } catch (error) {
      alert('Error deleting task');
    }
  };

  const handleEdit = async () => {
    const newTitle = prompt('Enter new title:', task.title);
    if (newTitle === null) return;

    const newDescription = prompt('Enter new description:', task.description || '');
    
    try {
      await updateTask(task.id, newTitle, newDescription, task.status);
      onUpdate();
    } catch (error) {
      alert('Error updating task');
    }
  };

  return (
    <div className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}>
      <div className="task-header">
        <div>
          <div className="task-title">
            {task.status === 'completed' && <span style={{ marginRight: '8px' }}>✓</span>}
            {task.title}
          </div>
        </div>
      </div>
      {task.description && <div className="task-description">{task.description}</div>}
      <div className="task-meta">
        <span>📅 Created: {formatDate(task.created_at)}</span>
        {task.completed_at && <span>✅ Completed: {formatDate(task.completed_at)}</span>}
        <span>
          {task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
        </span>
      </div>
      <div className="task-actions">
        {task.status === 'pending' ? (
          <button className="btn btn-complete" onClick={handleMarkComplete}>
            ✓ Mark Complete
          </button>
        ) : (
          <button className="btn btn-pending" onClick={handleMarkPending}>
            ↻ Mark Pending
          </button>
        )}
        <button className="btn btn-edit" onClick={handleEdit}>
          ✏️ Edit
        </button>
        <button className="btn btn-delete" onClick={handleDelete}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;

