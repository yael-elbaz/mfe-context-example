import React, { useEffect, useState } from 'react';
import './index.css';
// צורך את הסטור ישירות מה-Shell
import { useSelectedUnit } from 'shell/store';
import SectionCard, { OptionsButton } from 'shell/SectionCard';
import KpiRow, { type Kpi } from './components/KpiRow';
import TasksTable from './components/TasksTable';
import type { Task } from './types';

// סימולציה של קריאת API למונים לפי יחידה
async function fetchKpis(unitId: string): Promise<Kpi[]> {
  await new Promise((r) => setTimeout(r, 200));
  const base = { 'unit-1': 168, 'unit-2': 92, 'unit-3': 214 }[unitId] ?? 168;
  return [
    { id: 'k1', value: base,      label: 'אסירים יוצאים מהיחידה', icon: 'funnel' },
    { id: 'k2', value: base,      label: 'אסירים יוצאים מהיחידה', icon: 'alert' },
    { id: 'k3', value: base,      label: 'אסירים יוצאים מהיחידה', icon: 'alert' },
    { id: 'k4', value: base,      label: 'אסירים יוצאים מהיחידה', icon: 'alert' },
    { id: 'k5', value: base,      label: 'אסירים יוצאים מהיחידה', icon: 'funnel-alert' },
  ];
}

// סימולציה של קריאת API למטלות לפי יחידה
async function fetchTasks(unitId: string): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, 300));
  const row = (id: string, status: Task['status'], over: Partial<Task> = {}): Task => ({
    id,
    stage: 'כניסה לפיקוח',
    name: 'בטיפול משלט',
    subject: 'דוח תלונה',
    owner: 'ישראל ישאלי - רמלה',
    date: '11/01/2026',
    time: '15:48',
    status,
    ...over,
  });

  const allTasks: Record<string, Task[]> = {
    'unit-1': [
      row('t1', 'unit-read'),
      row('t2', 'open',      { subject: 'אישור תקציב רבעוני' }),
      row('t3', 'returned',  { subject: 'עדכון דוחות חשבונאיים' }),
      row('t4', 'unit-read', { subject: 'סגירת חשבונות שנתיים' }),
      row('t5', 'returned',  { stage: 'המתנה לאישור' }),
      row('t6', 'managed',   { stage: 'בבדיקת מפקד' }),
    ],
    'unit-2': [
      row('t7',  'open',      { subject: 'גיוס מפתח Full Stack' }),
      row('t8',  'managed',   { subject: 'עדכון נהלי עבודה' }),
      row('t9',  'unit-read', { subject: 'ראיון מועמד', stage: 'המתנה לאישור' }),
      row('t10', 'returned',  { subject: 'סבב הערכות' }),
    ],
    'unit-3': [
      row('t11', 'unit-read', { subject: 'שדרוג שרתי הפרודקשן' }),
      row('t12', 'open',      { subject: 'הטמעת MFA' }),
      row('t13', 'managed',   { subject: 'גיבוי מסדי נתונים' }),
      row('t14', 'returned',  { subject: 'סקר אבטחה', stage: 'בבדיקת מפקד' }),
      row('t15', 'unit-read', { subject: 'החלפת ציוד קצה' }),
    ],
  };
  return allTasks[unitId] ?? [];
}

interface Props {
  openService?: (meta: Record<string, any>) => void;
}

const App: React.FC<Props> = () => {
  // ✅ צורך ישירות מהסטור של ה-Shell — אין props, אין drilling
  const selectedUnit = useSelectedUnit();

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedUnit) return;

    setLoading(true);
    Promise.all([fetchKpis(selectedUnit.id), fetchTasks(selectedUnit.id)]).then(
      ([kpiData, taskData]) => {
        setKpis(kpiData);
        setTasks(taskData);
        setLoading(false);
      }
    );
  }, [selectedUnit?.id]); // נטען מחדש כשהמשתמש מחליף יחידה

  return (
    <div dir="rtl" className="flex w-full flex-col gap-6">
      {/* סקשן המונים */}
      <SectionCard
        title="מטלות"
        linkLabel="לכל המונים"
        count={kpis.length}
        countLabel="מספר מטלות ממתניות"
      >
        {loading && kpis.length === 0 ? (
          <p className="w-full py-6 text-right text-[14px] text-[#8E929F]">⏳ טוען מונים...</p>
        ) : (
          <KpiRow kpis={kpis} isLoading={loading} />
        )}
      </SectionCard>

      {/* סקשן המטלות */}
      <SectionCard
        title="מטלות"
        linkLabel="לכל המטלות"
        count={tasks.length}
        countLabel="מספר מטלות ממתניות"
        actions={<OptionsButton />}
      >
        {loading && tasks.length === 0 ? (
          <p className="w-full py-6 text-right text-[14px] text-[#8E929F]">⏳ טוען מטלות...</p>
        ) : (
          <TasksTable tasks={tasks} />
        )}
      </SectionCard>
    </div>
  );
};

export default App;
