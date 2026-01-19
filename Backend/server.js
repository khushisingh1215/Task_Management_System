const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const pool = require("./config/db");

// Import routes
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------- MIDDLEWARE ---------------------
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type"
}));
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// --------------------- API ROUTES ---------------------
app.use("/api/tasks", taskRoutes);

// --------------------- DATABASE INIT ---------------------
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// --------------------- REACT APP ---------------------
// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist', 'index.html'));
});

// --------------------- START SERVER ---------------------
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await initDB();
});
