import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import TaskModal from '../components/TaskModal';

const COLUMNS = ['To Do', 'In Progress', 'Completed'];

const COL_COLORS = {
  'To Do': 'var(--blue)',
  'In Progress': 'var(--yellow)',
  'Completed': 'var(--green)',
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(task) {
  if (task.status === 'Completed') return false;
  return new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
}

export default function Kanban() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

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

  const getColumnTasks = (status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;
    const srcIdx = source.index;
    const dstIdx = destination.index;

    // Build new task list
    const allTasks = [...tasks];
    const taskIdx = allTasks.findIndex((t) => t._id === draggableId);
    if (taskIdx === -1) return;

    // Optimistic update
    const updatedTasks = allTasks.map((t) => ({ ...t }));
    const movedTask = { ...updatedTasks[taskIdx], status: dstCol };

    // Recompute orders
    const srcTasks = updatedTasks
      .filter((t) => t._id !== draggableId && t.status === srcCol)
      .sort((a, b) => a.order - b.order);

    const dstTasks = updatedTasks
      .filter((t) => t._id !== draggableId && t.status === dstCol)
      .sort((a, b) => a.order - b.order);

    dstTasks.splice(dstIdx, 0, movedTask);

    const reordered = updatedTasks
      .filter((t) => t.status !== srcCol && t.status !== dstCol && t._id !== draggableId);

    srcTasks.forEach((t, i) => { t.order = i; reordered.push(t); });
    dstTasks.forEach((t, i) => { t.order = i; reordered.push(t); });

    setTasks(reordered);

    // Persist to backend
    try {
      const bulkData = reordered.map((t) => ({ id: t._id, order: t.order, status: t.status }));
      await api.put('/tasks/bulk/reorder', { tasks: bulkData });
    } catch {
      toast('Failed to save order. Refreshing...', 'error');
      fetchTasks();
    }
  };

  const handleAddTask = async (data) => {
    const res = await api.post('/tasks', data);
    setTasks((prev) => [...prev, res.data]);
    setShowAdd(false);
    toast('Task added to Kanban!', 'success');
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span>Loading board...</span>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Kanban Board</h1>
          <p className="page-subtitle">Drag tasks between columns to update their status</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = getColumnTasks(col);
            return (
              <div key={col} className="kanban-col">
                <div className="kanban-col-header">
                  <span className="kanban-col-title" style={{ color: COL_COLORS[col] }}>
                    <span style={{ fontSize: '1rem' }}>
                      {col === 'To Do' ? '○' : col === 'In Progress' ? '◑' : '●'}
                    </span>
                    {col}
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
                              <div className="kanban-card-meta">
                                📅 {formatDate(task.deadline)}
                                {isOverdue(task) && (
                                  <span style={{ color: 'var(--red)', marginLeft: '0.5rem' }}>⚠ Overdue</span>
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

      {showAdd && (
        <TaskModal
          title="Add Task"
          onSave={handleAddTask}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
