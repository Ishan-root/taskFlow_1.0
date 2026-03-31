import React from 'react';

export default function About() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">About TaskFlow</h1>
        <p className="page-subtitle">A personal and collaborative task management system</p>
      </div>

      <div className="about-grid">
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent2)' }}>
            ⬡ What is TaskFlow?
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            TaskFlow is a full-stack Task Management System (TMS) designed to help individuals and
            teams organise, track, and complete work efficiently. It features personal task tracking,
            a Kanban board, progress analytics, and a collaboration system for project-based teamwork.
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent2)' }}>
            ✦ Key Features
          </h2>
          <ul style={{ color: 'var(--text2)', fontSize: '0.92rem', lineHeight: 2, paddingLeft: '1.2rem' }}>
            <li>JWT-based authentication (register, login, logout)</li>
            <li>Personal task management with CRUD operations</li>
            <li>Drag-and-drop Kanban board</li>
            <li>Progress tracking with percentage completion</li>
            <li>Real-project collaboration with roles</li>
            <li>Overdue task detection</li>
          </ul>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent2)' }}>
            ⚙ Tech Stack
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              ['Frontend', 'React 18, React Router v6, @hello-pangea/dnd'],
              ['Backend', 'Node.js, Express.js'],
              ['Database', 'MongoDB with Mongoose'],
              ['Auth', 'JWT (jsonwebtoken), bcryptjs'],
              ['Styling', 'Custom CSS with design tokens'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text3)', minWidth: 90, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{label}</span>
                <span style={{ color: 'var(--text)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent2)' }}>
            📋 Task Status Flow
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span className="badge badge-todo">○ To Do</span>
            <span style={{ color: 'var(--text3)' }}>→</span>
            <span className="badge badge-inprogress">◑ In Progress</span>
            <span style={{ color: 'var(--text3)' }}>→</span>
            <span className="badge badge-completed">● Completed</span>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginTop: '1rem', lineHeight: 1.6 }}>
            Tasks start with a default status of <strong style={{ color: 'var(--blue)' }}>To Do</strong>.
            Use the Kanban board to drag tasks between columns, or edit them directly from the Home page.
            The Progress page updates automatically to reflect your latest status changes.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⬡</div>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent2)', marginBottom: '0.25rem' }}>
          TaskFlow TMS
        </div>
        <div style={{ color: 'var(--text3)', fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
          Built for the Software Engineering Design Assignment · 24BIT0281
        </div>
      </div>
    </div>
  );
}
