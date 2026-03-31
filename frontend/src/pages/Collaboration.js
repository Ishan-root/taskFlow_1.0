import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const COLUMNS = ['To Do', 'In Progress', 'Completed'];

const COL_COLORS = {
  'To Do': 'var(--blue)',
  'In Progress': 'var(--yellow)',
  'Completed': 'var(--green)',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(task) {
  if (task.status === 'Completed') return false;
  return new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
}

// ─── No-project view ──────────────────────────────────────────────────────────
function NoProject({ onRefresh }) {
  const toast = useToast();
  const { refreshUser } = useAuth();
  const [tab, setTab] = useState('join'); // 'join' | 'create'
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    if (!projectName.trim()) { setError('Project name is required'); return; }
    setLoading(true);
    try {
      const res = await api.post('/projects/create', { name: projectName.trim() });
      await refreshUser();
      toast(`Project created! Code: ${res.data.projectCode}`, 'success');
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setError('');
    if (!projectCode.trim()) { setError('Project ID is required'); return; }
    setLoading(true);
    try {
      await api.post('/projects/join', { projectCode: projectCode.trim() });
      await refreshUser();
      toast('Joined project!', 'success');
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid project ID. Project not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Collaboration</h1>
        <p className="page-subtitle">Join or create a project to collaborate with others</p>
      </div>

      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div className="card">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              className={`btn ${tab === 'join' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setTab('join'); setError(''); }}
            >
              Join Project
            </button>
            <button
              className={`btn ${tab === 'create' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setTab('create'); setError(''); }}
            >
              Create Project
            </button>
          </div>

          {tab === 'join' ? (
            <>
              <div className="form-group">
                <label className="form-label">Project ID</label>
                <input
                  className="form-input"
                  placeholder="e.g. alpha-team-482"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
              </div>
              {error && <div className="form-error">⚠ {error}</div>}
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                onClick={handleJoin}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Join Project'}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  className="form-input"
                  placeholder="Enter project name..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              {error && <div className="form-error">⚠ {error}</div>}
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Create Project'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add task modal ───────────────────────────────────────────────────────────
function AddProjectTaskModal({ contributors, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Task title is required'); return; }
    if (!deadline) { setError('Deadline is required'); return; }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), assignedTo: assignedTo || null, deadline });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">Add Project Task</h2>

        <div className="form-group">
          <label className="form-label">Task Title</label>
          <input
            className="form-input"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Assign To</label>
          <select
            className="form-select"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">— Unassigned —</option>
            {contributors.map((c) => (
              <option key={c._id} value={c._id}>{c.username}</option>
            ))}
          </select>
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

        {error && <div className="form-error">⚠ {error}</div>}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Collaboration page ──────────────────────────────────────────────────
export default function Collaboration() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('overview'); // 'overview' | 'kanban'
  const [showAddTask, setShowAddTask] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get('/projects/my');
      setProject(res.data);
    } catch {
      toast('Failed to load project', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const isHost = project && user && project.host?._id === user.id;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.projectCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast('Project code copied!', 'success');
  };

  const handleAddTask = async (data) => {
    const res = await api.post('/projects/tasks', data);
    setProject((prev) => ({
      ...prev,
      tasks: [...prev.tasks, res.data],
    }));
    setShowAddTask(false);
    toast('Task added to project!', 'success');
  };

  const handleLeave = async () => {
    try {
      await api.post('/projects/leave');
      await refreshUser();
      setProject(null);
      setShowLeave(false);
      toast('Left project', 'info');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to leave', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete('/projects/delete');
      await refreshUser();
      setProject(null);
      setShowDelete(false);
      toast('Project deleted', 'info');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete project', 'error');
    }
  };

  // Kanban drag end for project tasks
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const dstCol = destination.droppableId;
    const dstIdx = destination.index;
    const srcCol = source.droppableId;

    const allTasks = project.tasks.map((t) => ({ ...t }));
    const movedTask = allTasks.find((t) => t._id === draggableId);
    if (!movedTask) return;
    movedTask.status = dstCol;

    const srcTasks = allTasks
      .filter((t) => t._id !== draggableId && t.status === srcCol)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const dstTasks = allTasks
      .filter((t) => t._id !== draggableId && t.status === dstCol)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    dstTasks.splice(dstIdx, 0, movedTask);

    const other = allTasks.filter(
      (t) => t.status !== srcCol && t.status !== dstCol && t._id !== draggableId
    );

    srcTasks.forEach((t, i) => { t.order = i; });
    dstTasks.forEach((t, i) => { t.order = i; });

    const newTasks = [...other, ...srcTasks, ...dstTasks];
    setProject((prev) => ({ ...prev, tasks: newTasks }));

    try {
      await api.put('/projects/tasks/bulk/reorder', {
        tasks: newTasks.map((t) => ({ id: t._id, order: t.order, status: t.status })),
      });
    } catch {
      toast('Failed to save. Refreshing...', 'error');
      fetchProject();
    }
  };

  // ── Stats computation
  const projectStats = () => {
    if (!project) return {};
    const total = project.tasks.length;
    const done = project.tasks.filter((t) => t.status === 'Completed').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span>Loading collaboration...</span>
      </div>
    );
  }

  if (!project) {
    return <NoProject onRefresh={fetchProject} />;
  }

  const { total, done, pct } = projectStats();

  // Group tasks by contributor
  const tasksByContributor = () => {
    const map = {};
    project.contributors.forEach((c) => {
      map[c._id] = { user: c, tasks: [] };
    });
    // unassigned bucket
    map['unassigned'] = { user: { _id: 'unassigned', username: 'Unassigned' }, tasks: [] };

    project.tasks.forEach((task) => {
      const aid = task.assignedTo?._id || 'unassigned';
      if (map[aid]) map[aid].tasks.push(task);
      else map['unassigned'].tasks.push(task);
    });
    return Object.values(map);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">
            {isHost ? 'You are the host' : 'You are a contributor'} ·{' '}
            {project.contributors.length} participant{project.contributors.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
          <span
            className="project-code-box"
            onClick={handleCopyCode}
            title="Click to copy"
          >
            {copied ? '✓ Copied!' : project.projectCode}
          </span>
          {isHost && (
            <button className="btn btn-primary" onClick={() => setShowAddTask(true)}>
              + Add Task
            </button>
          )}
          {isHost ? (
            <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>
              Delete Project
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowLeave(true)}>
              Leave Project
            </button>
          )}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex-gap" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`btn ${view === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setView('overview')}
        >
          Overview
        </button>
        <button
          className={`btn ${view === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setView('kanban')}
        >
          Kanban Board
        </button>
      </div>

      {/* Progress summary */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 700 }}>Project Progress</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: pct === 100 ? 'var(--green)' : 'var(--accent2)' }}>
            {pct}%
          </span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '0.83rem', marginTop: '0.5rem' }}>
          {done} of {total} tasks completed
        </p>
      </div>

      {/* Overview — contributors & their tasks */}
      {view === 'overview' && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Participants & Tasks
          </h2>
          {project.contributors.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">No participants yet. Share the project code!</div>
            </div>
          ) : (
            <div className="contributor-grid">
              {tasksByContributor().map(({ user: contrib, tasks: ctasks }) => (
                <div key={contrib._id} className="contributor-card">
                  <div className="contributor-header">
                    <div className="contributor-avatar">
                      {contrib.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="contributor-name">
                        {contrib.username}
                        {project.host?._id === contrib._id && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent2)', marginLeft: '0.4rem', background: 'var(--accent-dim)', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>
                            host
                          </span>
                        )}
                      </div>
                      <div className="contributor-role">
                        {ctasks.length} task{ctasks.length !== 1 ? 's' : ''} assigned
                      </div>
                    </div>
                  </div>
                  <div className="contributor-tasks">
                    {ctasks.length === 0 ? (
                      <div className="no-tasks">No tasks assigned</div>
                    ) : (
                      ctasks.map((task) => (
                        <div key={task._id} className="contributor-task-item">
                          <span style={{ fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.title}
                            {isOverdue(task) && (
                              <span style={{ color: 'var(--red)', fontSize: '0.72rem', marginLeft: '0.3rem' }}>⚠</span>
                            )}
                          </span>
                          <StatusBadge status={task.status} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Project Board
            {!isHost && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 400, marginLeft: '0.75rem' }}>
                Drag cards to update status
              </span>
            )}
          </h2>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
              {COLUMNS.map((col) => {
                const colTasks = project.tasks
                  .filter((t) => t.status === col)
                  .sort((a, b) => (a.order || 0) - (b.order || 0));
                return (
                  <div key={col} className="kanban-col">
                    <div className="kanban-col-header">
                      <span className="kanban-col-title" style={{ color: COL_COLORS[col] }}>
                        {col === 'To Do' ? '○' : col === 'In Progress' ? '◑' : '●'} {col}
                      </span>
                      <span className="kanban-col-count">{colTasks.length}</span>
                    </div>
                    <Droppable droppableId={col}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`kanban-col-body kanban-drop-zone${snapshot.isDraggingOver ? ' drag-over' : ''}`}
                        >
                          {colTasks.length === 0 && !snapshot.isDraggingOver && (
                            <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.82rem', padding: '1rem 0' }}>
                              No tasks here
                            </div>
                          )}
                          {colTasks.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(prov, snap) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className={`kanban-card${snap.isDragging ? ' is-dragging' : ''}`}
                                >
                                  <div className="kanban-card-title">{task.title}</div>
                                  {task.assignedTo && (
                                    <div className="kanban-card-meta" style={{ marginBottom: '0.2rem' }}>
                                      👤 {task.assignedTo.username}
                                    </div>
                                  )}
                                  <div className="kanban-card-meta">
                                    📅 {formatDate(task.deadline)}
                                    {isOverdue(task) && (
                                      <span style={{ color: 'var(--red)', marginLeft: '0.5rem' }}>⚠</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </>
      )}

      {/* Modals */}
      {showAddTask && (
        <AddProjectTaskModal
          contributors={project.contributors}
          onSave={handleAddTask}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {showLeave && (
        <ConfirmDialog
          message="Are you sure you want to leave this project?"
          onConfirm={handleLeave}
          onCancel={() => setShowLeave(false)}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this project? This will remove all tasks and kick all members."
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
