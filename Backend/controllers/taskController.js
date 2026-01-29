const pool = require("../config/db");
const redisClient = require("../config/redis");

// Helper function to generate cache key
const generateCacheKey = (prefix, params) => {
  return `${prefix}:${JSON.stringify(params)}`;
};

// Helper function to get from cache or DB
const getCachedOrQuery = async (cacheKey, queryFn) => {
  if (!redisClient.isConnected) {
    return await queryFn();
  }
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Cache hit for', cacheKey);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('Redis get error:', err);
  }

  const result = await queryFn();
  try {
    await redisClient.setEx(cacheKey, 900, JSON.stringify(result)); // Cache for 15 minutes (aggressive)
  } catch (err) {
    console.error('Redis set error:', err);
  }
  return result;
};

// Helper to invalidate cache
const invalidateCache = async (patterns) => {
  if (!redisClient.isConnected) return;
  try {
    for (const pattern of patterns) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (err) {
    console.error('Redis invalidate error:', err);
  }
};

// Get all tasks with search, filter & pagination
const getAllTasks = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      page = 1,
      limit = 10,
      date = ""
    } = req.query;

    // Normalize page and limit to numbers
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));

    const params = { search, status, page: pageNum, limit: limitNum, date };
    const cacheKey = generateCacheKey('tasks:all', params);

    const result = await getCachedOrQuery(cacheKey, async () => {
      const offset = (pageNum - 1) * limitNum;
      let baseQuery = `WHERE 1=1`;
      let values = [];
      let paramIndex = 1;

      //  Search
      if (search) {
        baseQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`;
        values.push(`%${search}%`, `%${search}%`);
        paramIndex += 2;
      }

      //  Status filter
      if (status && status !== "all") {
        baseQuery += ` AND status = $${paramIndex}`;
        values.push(status);
        paramIndex += 1;
      }

      // Date filter
      if (date) {
        baseQuery += ` AND DATE(created_at) = $${paramIndex}`;
        values.push(date);
        paramIndex += 1;
      }

      // Total count (for pagination)
      const totalResult = await pool.query(
        `SELECT COUNT(*) as count FROM tasks ${baseQuery}`,
        values
      );
      const totalTasks = totalResult.rows[0].count;
      const totalPages = Math.ceil(totalTasks / limitNum);

      // Final data query
      const dataQuery = `
        SELECT *
        FROM tasks
        ${baseQuery}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await pool.query(dataQuery, [
        ...values,
        limitNum,
        offset
      ]);

      return {
        totalTasks,
        currentPage: pageNum,
        totalPages,
        tasks: result.rows
      };
    });

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get pending tasks
const getPendingTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5
    } = req.query;

    // Normalize page and limit
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 5));

    const params = { page: pageNum, limit: limitNum };
    const cacheKey = generateCacheKey('tasks:pending', params);

    const result = await getCachedOrQuery(cacheKey, async () => {
      const offset = (pageNum - 1) * limitNum;

      // Get total count
      const totalResult = await pool.query('SELECT COUNT(*) as count FROM tasks WHERE status = $1', ['pending']);
      const totalTasks = parseInt(totalResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalTasks / limitNum);

      // Get paginated results
      const result = await pool.query(
        'SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        ['pending', limitNum, offset]
      );

      return {
        totalTasks,
        currentPage: pageNum,
        totalPages,
        tasks: result.rows
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get completed tasks
const getCompletedTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5
    } = req.query;

    // Normalize page and limit
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 5));

    const params = { page: pageNum, limit: limitNum };
    const cacheKey = generateCacheKey('tasks:completed', params);

    const result = await getCachedOrQuery(cacheKey, async () => {
      const offset = (pageNum - 1) * limitNum;

      // Get total count
      const totalResult = await pool.query('SELECT COUNT(*) as count FROM tasks WHERE status = $1', ['completed']);
      const totalTasks = parseInt(totalResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalTasks / limitNum);

      // Get paginated results
      const result = await pool.query(
        'SELECT * FROM tasks WHERE status = $1 ORDER BY completed_at DESC LIMIT $2 OFFSET $3',
        ['completed', limitNum, offset]
      );

      return {
        totalTasks,
        currentPage: pageNum,
        totalPages,
        tasks: result.rows
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recent activity (last 10 tasks)
const getRecentTasks = async (req, res) => {
  try {
    const cacheKey = 'tasks:recent';

    const result = await getCachedOrQuery(cacheKey, async () => {
      const result = await pool.query(`
        SELECT * FROM tasks 
        ORDER BY updated_at DESC 
        LIMIT 10
      `);
      return result.rows;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { title, description } = req.body;

    // validation
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING id',
      [title, description || null]
    );

    // Invalidate cache
    await invalidateCache(['tasks:*']);

    res.status(201).json({
      id: result.rows[0].id,
      title,
      description: description || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null
    });
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    const now = new Date().toISOString();
    const completedAt = status === 'completed' ? now : null;

    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = $4, completed_at = $5 WHERE id = $6`,
      [title, description, status, now, completedAt, id]
    );

    // Invalidate cache
    await invalidateCache(['tasks:*']);

    // Fetch and return the updated task
    const updatedTask = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    res.json(updatedTask.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    // Invalidate cache
    await invalidateCache(['tasks:*']);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTasks,
  getPendingTasks,
  getCompletedTasks,
  getRecentTasks,
  createTask,
  updateTask,
  deleteTask
};

