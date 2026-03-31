import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

function isOverdue(task) {
  if (task.status === 'Completed') return false;
  return new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Home() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);

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

  const handleAdd = async (data) => {
    const res = await api.post('/tasks', data);
    setTasks((prev) => [...prev, res.data]);
    setShowAdd(false);
    toast('Task added!', 'success');
  };

  const handleEdit = async (data) => {
    const res = await api.put(`/tasks/${editTask._id}`, data);
    setTasks((prev) => prev.map((t) => (t._id === editTask._id ? res.data : t)));
    setEditTask(null);
    toast('Task updated!', 'success');
  };

  const handleDelete = async () => {
    await api.delete(`/tasks/${deleteTask._id}`);
    setTasks((prev) => prev.filter((t) => t._id !== deleteTask._id));
    setDeleteTask(null);
    toast('Task deleted', 'info');
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span>Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">Welcome back, {user?.username} — manage your personal tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No tasks yet. Click "Add Task" to get started.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} className={isOverdue(task) ? 'overdue' : ''}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{task.title}</span>
                    {isOverdue(task) && (
                      <span className="badge badge-overdue" style={{ marginLeft: '0.5rem' }}>
                        Overdue
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text2)' }}>
                    {formatDate(task.deadline)}
                  </td>
                  <td>
                    <StatusBadge status={task.status} />
                  </td>
                  <td>
                    <div className="flex-gap">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditTask(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTask(task)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <TaskModal
          title="Add Task"
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editTask && (
        <TaskModal
          title="Edit Task"
          task={editTask}
          onSave={handleEdit}
          onClose={() => setEditTask(null)}
        />
      )}

      {deleteTask && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTask.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTask(null)}
        />
      )}
    </div>
  );
}
