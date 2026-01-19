const pool = require("../config/db");

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending tasks
const getPendingTasks = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE status = 'pending' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get completed tasks
const getCompletedTasks = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE status = 'completed' ORDER BY completed_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recent activity (last 10 tasks)
const getRecentTasks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tasks 
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    console.log("Request body:", req.body);   // DEBUG

    const { title, description } = req.body;

    // validation
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Insert error:", error); // DEBUG
    res.status(500).json({ error: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    let query, values;
    if (status === 'completed') {
      query = 'UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *';
      values = [title, description, status, id];
    } else {
      query = 'UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP, completed_at = NULL WHERE id = $4 RETURNING *';
      values = [title, description, status, id];
    }
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
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

