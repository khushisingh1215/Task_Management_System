const API_URL = 'http://localhost:3000/api';
let lastFetchTime = {};
let pendingRequests = {}; // Prevent duplicate simultaneous requests
let requestTimers = {}; // Debounce timers
const CACHE_DURATION = 60000; // 60 seconds cache (aggressive caching)
const DEBOUNCE_DELAY = 2500; // Debounce rapid requests by 2.5 seconds
const STALE_TIME = 90000; // Consider cache stale after 90 seconds but still usable up to 180s

// Cache persistence to localStorage
const getCachedData = (key) => {
  try {
    const cached = window.__apiCache?.[key];
    const timestamp = lastFetchTime[key];
    if (cached && timestamp) {
      return { data: cached, age: Date.now() - timestamp };
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }
  return null;
};

const setCachedData = (key, data) => {
  if (!window.__apiCache) window.__apiCache = {};
  window.__apiCache[key] = data;
  lastFetchTime[key] = Date.now();
};

/**
 * Debounced fetch function to prevent rapid API calls
 */
const debouncedFetch = (cacheKey, fetchFn) => {
  return new Promise((resolve, reject) => {
    // Clear existing timer if any
    if (requestTimers[cacheKey]) {
      clearTimeout(requestTimers[cacheKey]);
    }

    // Set new debounce timer
    requestTimers[cacheKey] = setTimeout(async () => {
      try {
        const data = await fetchFn();
        setCachedData(cacheKey, data);
        resolve(data);
      } catch (error) {
        reject(error);
      } finally {
        delete requestTimers[cacheKey];
      }
    }, DEBOUNCE_DELAY);
  });
};

/**
 * Fetch tasks with optional search, pagination & status
 */
export const fetchTasks = async ({
  search = '',
  page = 1,
  limit = 5,
  status = ''
} = {}) => {
  // Normalize page to number
  const normalizedPage = Number(page) || 1;
  const cacheKey = `tasks_${search}_${normalizedPage}_${limit}_${status}`;
  const now = Date.now();
  
  // For pagination changes, skip cache and fetch fresh
  const cached = getCachedData(cacheKey);
  if (cached && cached.age < CACHE_DURATION) {
    return cached.data;
  }

  // Return pending request if already in flight to avoid duplicate calls
  if (pendingRequests[cacheKey]) {
    return pendingRequests[cacheKey];
  }

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('page', normalizedPage);
  if (limit) params.append('limit', limit);
  if (status) params.append('status', status);

  async function fetchNewTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('API Error for page', normalizedPage, ':', error);
      throw error;
    } finally {
      delete pendingRequests[cacheKey];
    }
  }

  pendingRequests[cacheKey] = fetchNewTasks();
  return pendingRequests[cacheKey];
};

// Pending tasks with aggressive caching
export const fetchPendingTasks = async (page = 1, limit = 1) => {
  const cacheKey = `pending_${page}_${limit}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached && cached.age < CACHE_DURATION) {
    return cached.data;
  }

  // Return pending request if already in flight
  if (pendingRequests[cacheKey]) {
    return pendingRequests[cacheKey];
  }

  // Return stale cache while fetching
  if (cached && cached.age < STALE_TIME * 2) {
    if (!pendingRequests[cacheKey]) {
      pendingRequests[cacheKey] = fetchNewPendingTasks();
    }
    return cached.data;
  }

  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);

  async function fetchNewPendingTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks/pending?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch pending tasks');
      const data = await response.json();
      setCachedData(cacheKey, data);
      return data.tasks || data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    } finally {
      delete pendingRequests[cacheKey];
    }
  }

  pendingRequests[cacheKey] = fetchNewPendingTasks();
  return pendingRequests[cacheKey];
};

// Completed tasks with aggressive caching
export const fetchCompletedTasks = async (page = 1, limit = 1) => {
  const cacheKey = `completed_${page}_${limit}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached && cached.age < CACHE_DURATION) {
    return cached.data;
  }

  // Return pending request if already in flight
  if (pendingRequests[cacheKey]) {
    return pendingRequests[cacheKey];
  }

  // Return stale cache while fetching
  if (cached && cached.age < STALE_TIME * 2) {
    if (!pendingRequests[cacheKey]) {
      pendingRequests[cacheKey] = fetchNewCompletedTasks();
    }
    return cached.data;
  }

  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);

  async function fetchNewCompletedTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks/completed?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch completed tasks');
      const data = await response.json();
      setCachedData(cacheKey, data);
      return data.tasks || data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    } finally {
      delete pendingRequests[cacheKey];
    }
  }

  pendingRequests[cacheKey] = fetchNewCompletedTasks();
  return pendingRequests[cacheKey];
};

// Recent tasks with aggressive caching
export const fetchRecentTasks = async () => {
  const cacheKey = 'recent_tasks';
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached && cached.age < CACHE_DURATION) {
    return cached.data;
  }

  // Return pending request if already in flight
  if (pendingRequests[cacheKey]) {
    return pendingRequests[cacheKey];
  }

  // Return stale cache while fetching
  if (cached && cached.age < STALE_TIME * 2) {
    if (!pendingRequests[cacheKey]) {
      pendingRequests[cacheKey] = fetchNewRecentTasks();
    }
    return cached.data;
  }

  async function fetchNewRecentTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks/recent`);
      if (!response.ok) throw new Error('Failed to fetch recent tasks');
      const data = await response.json();
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    } finally {
      delete pendingRequests[cacheKey];
    }
  }

  pendingRequests[cacheKey] = fetchNewRecentTasks();
  return pendingRequests[cacheKey];
};

// Create task
export const createTask = async (title, description) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

// Update task
export const updateTask = async (id, title, description, status) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, status }),
  });

  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

// Delete task
export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to delete task');
  return response.json();
};
