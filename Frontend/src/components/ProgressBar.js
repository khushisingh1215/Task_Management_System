import React, { useState, useEffect, useRef } from 'react';
import { fetchTasks } from '../services/api';

const ProgressBar = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Fetch with large limit to get all tasks for calculation
      const response = await fetchTasks({ limit: 1000, page: 1 });
      
      const taskList = response?.tasks || (Array.isArray(response) ? response : []);
      
      if (Array.isArray(taskList) && taskList.length > 0) {
        const completed = taskList.filter(t => t.status === 'completed').length;
        const pending = taskList.filter(t => t.status === 'pending').length;
        const total = taskList.length;
        const percentage = Math.round((completed / total) * 100);
        
        setStats({ total, completed, pending });
        setProgress(percentage);
      } else {
        setStats({ total: 0, completed: 0, pending: 0 });
        setProgress(0);
      }
    } catch (error) {
      console.error('Error loading progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Refresh every 5 minutes instead of 10
    const interval = setInterval(loadStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const { total: totalTasks, completed: completedTasks, pending: pendingTasks } = stats;

  return (
    <div className="progress-sidebar">
      <div className="progress-header">
        <h3>📊 Progress</h3>
      </div>
      
      <div className="progress-container">
        <div className="progress-circle">
          <svg className="progress-ring" width="120" height="120">
            <circle
              className="progress-ring-background"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="8"
            />
            <circle
              className="progress-ring-fill"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          <div className="progress-percentage">
            <span className="progress-number">{progress}%</span>
            <span className="progress-label">Complete</span>
          </div>
        </div>
      </div>

      <div className="progress-stats">
        <div className="progress-stat-item">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        
        <div className="progress-stat-item">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value completed">{completedTasks}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        
        <div className="progress-stat-item">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value pending">{pendingTasks}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      <div className="progress-bar-linear">
        <div className="progress-bar-label">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

