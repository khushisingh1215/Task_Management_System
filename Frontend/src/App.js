import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import ProgressBar from './components/ProgressBar';

// Lazy load components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const PendingTasks = React.lazy(() => import('./components/PendingTasks'));
const CompletedTasks = React.lazy(() => import('./components/CompletedTasks'));
const RecentActivity = React.lazy(() => import('./components/RecentActivity'));

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
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pending" element={<PendingTasks />} />
              <Route path="/completed" element={<CompletedTasks />} />
              <Route path="/recent" element={<RecentActivity />} />
            </Routes>
          </Suspense>
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

