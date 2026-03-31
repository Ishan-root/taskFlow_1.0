import React from 'react';

export default function StatusBadge({ status }) {
  const classMap = {
    'To Do': 'badge-todo',
    'In Progress': 'badge-inprogress',
    'Completed': 'badge-completed',
  };
  const dotMap = {
    'To Do': '○',
    'In Progress': '◑',
    'Completed': '●',
  };
  return (
    <span className={`badge ${classMap[status] || 'badge-todo'}`}>
      {dotMap[status] || '○'} {status}
    </span>
  );
}
