import React, { useEffect, useState } from 'react';
// צורך את הסטור ישירות מה-Shell
import { useUser, useSelectedUnit } from 'shell/store';
import { TaskList } from './components/TaskList';

interface Task {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'done';
}

// סימולציה של קריאת API למשימות לפי יחידה
async function fetchTasks(unitId: string): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, 300));
  const allTasks: Record<string, Task[]> = {
    'unit-1': [
      { id: 't1', title: 'אישור תקציב רבעוני', status: 'open' },
      { id: 't2', title: 'עדכון דוחות חשבונאיים', status: 'in-progress' },
      { id: 't3', title: 'סגירת חשבונות שנתיים', status: 'done' },
    ],
    'unit-2': [
      { id: 't4', title: 'גיוס מפתח Full Stack', status: 'in-progress' },
      { id: 't5', title: 'עדכון נהלי עבודה', status: 'open' },
    ],
    'unit-3': [
      { id: 't6', title: 'שדרוג שרתי הפרודקשן', status: 'open' },
      { id: 't7', title: 'הטמעת MFA לכל המשתמשים', status: 'in-progress' },
      { id: 't8', title: 'גיבוי מסדי נתונים', status: 'done' },
    ],
  };
  return allTasks[unitId] ?? [];
}

const App: React.FC = () => {
  // ✅ צורך ישירות מהסטור של ה-Shell — אין props, אין drilling
  const user = useUser();
  const selectedUnit = useSelectedUnit();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedUnit) return;

    setLoading(true);
    fetchTasks(selectedUnit.id).then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, [selectedUnit?.id]); // נטען מחדש כשהמשתמש מחליף יחידה

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #eee',
        }}
      >
        <h2 style={{ margin: 0, color: '#1e3a5f' }}>📝 מודול משימות</h2>
        {user && (
          <span style={{ fontSize: '13px', color: '#888' }}>
            מחובר כ: {user.email}
          </span>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>⏳ טוען משימות...</p>
      ) : (
        <TaskList
          tasks={tasks}
          unitName={selectedUnit?.name ?? ''}
        />
      )}
    </div>
  );
};

export default App;
