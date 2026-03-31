import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

function isOverdue(task) {
  if (task.status === 'Completed') return false;
  return new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function Progress() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch {
      toast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const todo = tasks.filter((t) => t.status === 'To Do').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdueTasks = tasks.filter(isOverdue);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span>Loading progress...</span>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">My Progress</h1>
        <p className="page-subtitle">Track your personal task completion</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{completed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>{inProgress}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">To Do</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{todo}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{overdueTasks.length}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Completion Rate</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: percentage === 100 ? 'var(--green)' : 'var(--accent2)',
            }}
          >
            {percentage}%
          </span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '0.84rem', marginTop: '0.75rem' }}>
          {completed} of {total} tasks completed
        </p>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--red)' }}>
            ⚠ Overdue Tasks ({overdueTasks.length})
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {overdueTasks.map((task) => (
                  <tr key={task._id} className="overdue">
                    <td style={{ fontWeight: 600 }}>{task.title}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--red)' }}>
                      {formatDate(task.deadline)}
                    </td>
                    <td><StatusBadge status={task.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Tasks */}
      {tasks.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            All Tasks
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className={isOverdue(task) ? 'overdue' : ''}>
                    <td style={{ fontWeight: 600 }}>{task.title}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text2)' }}>
                      {formatDate(task.deadline)}
                    </td>
                    <td><StatusBadge status={task.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">No tasks yet. Add tasks from the Home page to track progress.</div>
        </div>
      )}
    </div>
  );
}
