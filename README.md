# ✨ Task Manager Application

A full-stack task management application built with React and Node.js, featuring a clean and intuitive interface for managing your daily tasks efficiently.

<img width="1897" height="889" alt="Screenshot 2026-01-09 111427" src="https://github.com/user-attachments/assets/ec796602-79c8-49c2-a68f-c78b7028f435" />


## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Frontend Components](#-frontend-components)
- [Backend Architecture](#-backend-architecture)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

## ✨ Features

- *📊 Dashboard Overview*: Get a comprehensive view of all your tasks with statistics
- *⏳ Pending Tasks*: View and manage all pending tasks in one place
- *✅ Completed Tasks*: Track your completed tasks and accomplishments
- *🕐 Recent Activity*: Monitor the latest updates and changes
- *➕ Add Tasks*: Easily create new tasks with title and description
- *✏️ Edit Tasks*: Update task details on the fly
- *🗑️ Delete Tasks*: Remove tasks you no longer need
- *🔄 Status Management*: Toggle between pending and completed status
- *📈 Progress Tracking*: Visual progress bar showing completion percentage
- *🎨 Modern UI*: Beautiful and responsive design



## 🛠️ Tech Stack

### Frontend
- *React 18.2.0* - UI library
- *React Router DOM 6.20.0* - Client-side routing
- *Webpack 5* - Module bundler
- *Babel* - JavaScript compiler
- *CSS3* - Styling

### Backend
- *Node.js* - Runtime environment
- *Express.js 4.22.1* - Web framework
- *PostgreSQL* - Relational database
- *pg (node-postgres)* - PostgreSQL client
- *CORS* - Cross-origin resource sharing
- *dotenv* - Environment variable management

### Architecture Pattern
- *MVC (Model-View-Controller)* - Separation of concerns
  - *Models*: Database schema and queries
  - *Views*: React components
  - *Controllers*: Business logic in Backend/controllers/









## 🚀 Installation

### Prerequisites

- *Node.js* (v14 or higher)
- *PostgreSQL* (v12 or higher)
- *npm* or *yarn*

### Step 1: Clone the Repository

bash
git clone <repository-url>
cd task-manager


### Step 2: Install Backend Dependencies

bash
cd Backend
npm install


### Step 3: Install Frontend Dependencies

bash
cd ../Frontend
npm install


### Step 4: Set Up PostgreSQL Database

1. Create a new PostgreSQL database:

sql
CREATE DATABASE taskmanager;


2. The database table will be created automatically when you start the server.

## ⚙️ Configuration

### Backend Configuration

Create a .env file in the Backend directory:

env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=taskmanager
DB_PASSWORD=your_password
DB_PORT=5432


### Frontend Configuration

The frontend API URL is configured in Frontend/src/services/api.js. By default, it points to:

javascript
const API_URL = 'http://localhost:3000/api';

## 🎯 Usage

### Development Mode

#### Start Backend Server

bash
cd Backend
npm run dev    # Uses nodemon for auto-reload
# or
npm start      # Standard start


The backend server will run on http://localhost:3000

#### Start Frontend Development Server

bash
cd Frontend
npm run dev


The frontend will be available at http://localhost:3001 (or the port shown in terminal)

### Production Mode

#### Build Frontend

bash
cd Frontend
npm run build


This creates an optimized production build in the Frontend/dist directory.

#### Start Production Server

bash
cd Backend
npm start


The Express server will serve both the API and the React app.

### Accessing the Application

Open your browser and navigate to:
- *Development*: http://localhost:3001 (if using webpack-dev-server)
- *Production*: http://localhost:3000


## 📡 API Documentation

### Base URL

http://localhost:3000/api/tasks


### Endpoints

#### 1. Get All Tasks
- *Endpoint*: GET /api/tasks
- *Description*: Retrieves all tasks ordered by creation date
- *Response*: Array of task objects
- *Used by*: Dashboard component

json
[
  {
    "id": 1,
    "title": "Complete project",
    "description": "Finish the task manager app",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "completed_at": null
  }
]


#### 2. Get Pending Tasks
- *Endpoint*: GET /api/tasks/pending
- *Description*: Retrieves all tasks with status 'pending'
- *Response*: Array of pending task objects
- *Used by*: PendingTasks component

#### 3. Get Completed Tasks
- *Endpoint*: GET /api/tasks/completed
- *Description*: Retrieves all tasks with status 'completed'
- *Response*: Array of completed task objects
- *Used by*: CompletedTasks component

#### 4. Get Recent Activity
- *Endpoint*: GET /api/tasks/recent
- *Description*: Retrieves the last 10 updated tasks
- *Response*: Array of task objects (max 10)
- *Used by*: Dashboard and RecentActivity components

#### 5. Create Task
- *Endpoint*: POST /api/tasks
- *Description*: Creates a new task
- *Request Body*:
json
{
  "title": "Task title",
  "description": "Task description (optional)"
}

- *Response*: Created task object
- *Used by*: AddTaskModal component

#### 6. Update Task
- *Endpoint*: PUT /api/tasks/:id
- *Description*: Updates an existing task
- *URL Parameters*: id (task ID)
- *Request Body*:
json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed"
}

- *Response*: Updated task object
- *Used by*: TaskCard component

#### 7. Delete Task
- *Endpoint*: DELETE /api/tasks/:id
- *Description*: Deletes a task
- *URL Parameters*: id (task ID)
- *Response*:
json
{
  "message": "Task deleted successfully"
}

- *Used by*: TaskCard component





## 🎨 Frontend Components

### Dashboard Component
- *Location*: Frontend/src/components/Dashboard.js
- *Purpose*: Main landing page showing task statistics and recent activity
- *Features*:
  - Total tasks count
  - Pending tasks count
  - Completed tasks count
  - Recent tasks list (last 5)
  - Add new task button

### PendingTasks Component
- *Location*: Frontend/src/components/PendingTasks.js
- *Purpose*: Displays all pending tasks
- *Features*:
  - List of all pending tasks
  - Add new task functionality
  - Task management actions

### CompletedTasks Component
- *Location*: Frontend/src/components/CompletedTasks.js
- *Purpose*: Displays all completed tasks
- *Features*:
  - List of all completed tasks
  - Task details with completion dates

### RecentActivity Component
- *Location*: Frontend/src/components/RecentActivity.js
- *Purpose*: Shows recent task updates
- *Features*:
  - Last 10 updated tasks
  - Real-time activity tracking

### TaskCard Component
- *Location*: Frontend/src/components/TaskCard.js
- *Purpose*: Individual task display and actions
- *Features*:
  - Task title and description
  - Creation and completion dates
  - Mark as complete/pending
  - Edit task
  - Delete task

### AddTaskModal Component
- *Location*: Frontend/src/components/AddTaskModal.js
- *Purpose*: Modal form for creating new tasks
- *Features*:
  - Title input (required)
  - Description textarea (optional)
  - Form validation

### ProgressBar Component
- *Location*: Frontend/src/components/ProgressBar.js
- *Purpose*: Visual progress indicator
- *Features*:
  - Shows completion percentage
  - Updates in real-time
 
  - 
<img width="1877" height="879" alt="Screenshot 2026-01-19 154007" src="https://github.com/user-attachments/assets/8616d429-88a9-4a41-856a-ee63c023d4e6" />
<img width="1890" height="888" alt="Screenshot 2026-01-19 154119" src="https://github.com/user-attachments/assets/4694f989-146e-470b-b6b5-7806e9d1ed56" />


## 🏗️ Backend Architecture

### MVC Pattern Implementation

#### Controllers (Backend/controllers/taskController.js)
Contains all business logic:
- getAllTasks() - Fetch all tasks
- getPendingTasks() - Fetch pending tasks
- getCompletedTasks() - Fetch completed tasks
- getRecentTasks() - Fetch recent activity
- createTask() - Create new task with validation
- updateTask() - Update existing task
- deleteTask() - Delete task

#### Routes (Backend/routes/taskRoutes.js)
Contains only route definitions:
- Maps HTTP methods and paths to controller functions
- Clean separation of routing from business logic
- Well-documented endpoint-to-component mapping

#### Database (Backend/config/db.js)
- PostgreSQL connection pool
- Environment-based configuration
- Connection management

#### Server (Backend/server.js)
- Express app setup
- Middleware configuration (CORS, JSON parsing)
- Route mounting
- Database initialization
- Static file serving

### Database Schema

sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);


## 📸 Screenshots

### Dashboard View
<img width="1897" height="889" alt="Screenshot 2026-01-09 111427" src="https://github.com/user-attachments/assets/77a3b6e9-1540-475f-9c0c-d6006c140559" />


### Pending Tasks View
<img width="1900" height="852" alt="Screenshot 2026-01-09 111622" src="https://github.com/user-attachments/assets/a776bb96-94e3-4a4a-80f0-5ee120b8ac84" />

### Completed Tasks View
<img width="1906" height="876" alt="Screenshot 2026-01-09 111638" src="https://github.com/user-attachments/assets/8857ef88-91e9-41f8-b3dd-80ee8976521a" />


### Add Task Modal
<img width="1898" height="872" alt="Screenshot 2026-01-19 160409" src="https://github.com/user-attachments/assets/04ed8464-4434-4e7e-8754-07e756da95cb" />


### Task Card Actions
<img width="1867" height="864" alt="Screenshot 2026-01-19 153916" src="https://github.com/user-attachments/assets/5cf01ba6-93d4-4536-8b44-3776808f0968" />


## 🔄 Endpoint to Component Mapping

| Endpoint | Method | Controller | Frontend Component |
|----------|--------|------------|-------------------|
| /api/tasks | GET | getAllTasks | Dashboard |
| /api/tasks/pending | GET | getPendingTasks | PendingTasks |
| /api/tasks/completed | GET | getCompletedTasks | CompletedTasks |
| /api/tasks/recent | GET | getRecentTasks | Dashboard, RecentActivity |
| /api/tasks | POST | createTask | AddTaskModal |
| /api/tasks/:id | PUT | updateTask | TaskCard |
| /api/tasks/:id | DELETE | deleteTask | TaskCard |

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure database exists: CREATE DATABASE taskmanager;

### Port Already in Use
- Change PORT in Backend/.env
- Update API_URL in Frontend/src/services/api.js

### CORS Errors
- Backend CORS is configured to allow all origins
- Check if backend server is running

### Build Issues
- Clear node_modules and reinstall: rm -rf node_modules && npm install
- Clear webpack cache: rm -rf Frontend/dist

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.
