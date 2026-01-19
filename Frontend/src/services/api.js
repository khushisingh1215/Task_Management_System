const API_URL = 'http://localhost:3000/api';

export const fetchTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const fetchPendingTasks = async () => {
  const response = await fetch(`${API_URL}/tasks/pending`);
  if (!response.ok) throw new Error('Failed to fetch pending tasks');
  return response.json();
};

export const fetchCompletedTasks = async () => {
  const response = await fetch(`${API_URL}/tasks/completed`);
  if (!response.ok) throw new Error('Failed to fetch completed tasks');
  return response.json();
};

export const fetchRecentTasks = async () => {
  const response = await fetch(`${API_URL}/tasks/recent`);
  if (!response.ok) throw new Error('Failed to fetch recent tasks');
  return response.json();
};

export const createTask = async (title, description) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const updateTask = async (id, title, description, status) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, status }),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete task');
  return response.json();
};

