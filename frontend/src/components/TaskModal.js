import React, { useState, useEffect } from 'react';

export default function TaskModal({ task, onSave, onClose, title = 'Add Task' }) {
  const [taskName, setTaskName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('To Do');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTaskName(task.title || '');
      setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
      setStatus(task.status || 'To Do');
    }
  }, [task]);

  const handleSubmit = async () => {
    setError('');
    if (!taskName.trim()) { setError('Task name is required'); return; }
    if (!deadline) { setError('Deadline is required'); return; }
    setSaving(true);
    try {
      await onSave({ title: taskName.trim(), deadline, status });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{title}</h2>

        <div className="form-group">
          <label className="form-label">Task Name</label>
          <input
            className="form-input"
            placeholder="Enter task name..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Deadline</label>
          <input
            type="date"
            className="form-input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {task && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        )}

        {error && <div className="form-error">⚠ {error}</div>}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="spinner" /> : null}
            {task ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
