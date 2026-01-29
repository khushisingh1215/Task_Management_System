import React, { useState, useEffect } from 'react';
import { updateTask } from '../services/api';

const EditTaskModal = ({ isOpen, onClose, onTaskUpdated, task, allTasks }) => {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editFields, setEditFields] = useState({
    title: false,
    description: false
  });

  useEffect(() => {
    if (task) {
      setSelectedTaskId(task.id);
      setTitle(task.title || '');
      setDescription(task.description || '');
    }
  }, [task]);

  const handleTaskSelect = (e) => {
    const taskId = e.target.value;
    setSelectedTaskId(taskId);
    
    if (taskId) {
      const selectedTask = allTasks.find(t => t.id === parseInt(taskId));
      if (selectedTask) {
        setTitle(selectedTask.title || '');
        setDescription(selectedTask.description || '');
        setEditFields({
          title: false,
          description: false
        });
      }
    }
  };

  const handleFieldToggle = (field) => {
    setEditFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTaskId) {
      alert('Please select a task to edit');
      return;
    }

    const selectedTask = allTasks.find(t => t.id === parseInt(selectedTaskId));
    if (!selectedTask) return;

    // Only update fields that were selected for editing
    const updatedTitle = editFields.title ? title : selectedTask.title;
    const updatedDescription = editFields.description ? description : selectedTask.description;

    try {
      await updateTask(selectedTaskId, updatedTitle, updatedDescription, selectedTask.status);
      setSelectedTaskId('');
      setTitle('');
      setDescription('');
      setEditFields({
        title: false,
        description: false
      });
      onClose();
      onTaskUpdated();
    } catch (error) {
      alert('Error updating task');
    }
  };

  if (!isOpen) return null;

  const tasksToShow = allTasks && Array.isArray(allTasks) ? allTasks : [];

  return (
    <div className="modal" onClick={(e) => e.target.className === 'modal' && onClose()}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>✏️ Edit Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="selectTask">Select Task to Edit</label>
            <select
              id="selectTask"
              value={selectedTaskId}
              onChange={handleTaskSelect}
              className="filter-select"
              required
            >
              <option value="">-- Choose a task --</option>
              {tasksToShow.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {selectedTaskId && (
            <>
              <div className="form-group">
                <div className="field-checkbox">
                  <input
                    type="checkbox"
                    id="editTitle"
                    checked={editFields.title}
                    onChange={() => handleFieldToggle('title')}
                  />
                  <label htmlFor="editTitle">Edit Title</label>
                </div>
                {editFields.title && (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter new title..."
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <div className="field-checkbox">
                  <input
                    type="checkbox"
                    id="editDescription"
                    checked={editFields.description}
                    onChange={() => handleFieldToggle('description')}
                  />
                  <label htmlFor="editDescription">Edit Description</label>
                </div>
                {editFields.description && (
                  <textarea
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter new description (optional)..."
                  />
                )}
              </div>

              <div className="form-info">
                <p>ℹ️ Check the fields you want to edit, unselected fields will remain unchanged</p>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary">Update Task</button>
        </form>
      </div>    </div>
  );
};

export default EditTaskModal;