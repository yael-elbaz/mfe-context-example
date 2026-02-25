import React from 'react';

interface Task {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'done';
}

const statusLabel: Record<Task['status'], string> = {
  open: '📋 פתוח',
  'in-progress': '🔄 בטיפול',
  done: '✅ הושלם',
};

const statusColor: Record<Task['status'], string> = {
  open: '#e8f0fe',
  'in-progress': '#fff3cd',
  done: '#d4edda',
};

interface Props {
  tasks: Task[];
  unitName: string;
}

export const TaskList: React.FC<Props> = ({ tasks, unitName }) => {
  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1e3a5f' }}>
        משימות עבור: <span style={{ color: '#0066cc' }}>{unitName}</span>
      </h3>

      {tasks.length === 0 ? (
        <p style={{ color: '#888' }}>אין משימות ליחידה זו.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: statusColor[task.status],
                border: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 500 }}>{task.title}</span>
              <span style={{ fontSize: '13px', color: '#444' }}>
                {statusLabel[task.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
