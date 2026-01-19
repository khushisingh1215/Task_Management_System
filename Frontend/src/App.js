import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PendingTasks from './components/PendingTasks';
import CompletedTasks from './components/CompletedTasks';
import RecentActivity from './components/RecentActivity';
import ProgressBar from './components/ProgressBar';

function AppContent() {
  const location = useLocation();

  return (
    <div className="app-wrapper">
      <ProgressBar />
      <div className="container">
        <header>
          <h1>✨ Task Manager</h1>
          <nav>
            <NavLink to="/" end>📊 Dashboard</NavLink>
            <NavLink to="/pending">⏳ Pending Tasks</NavLink>
            <NavLink to="/completed">✅ Completed Tasks</NavLink>
            <NavLink to="/recent">🕐 Recent Activity</NavLink>
          </nav>
        </header>

        <main key={location.pathname}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pending" element={<PendingTasks />} />
            <Route path="/completed" element={<CompletedTasks />} />
            <Route path="/recent" element={<RecentActivity />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

