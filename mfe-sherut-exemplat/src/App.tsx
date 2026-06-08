import React, { useEffect, useState } from 'react';

interface Props {
  idntSheryut?: string;
  employeeId?: string;
}

interface SherutData {
  title: string;
  description: string;
  status: 'פתוח' | 'ממתין' | 'הושלם';
  category: string;
  currentStepIndex: number;
  fields: { label: string; value: string }[];
}

const STEPS = ['הגשת בקשה', 'אישור מנהל ישיר', 'אישור HR', 'אישור סופי'];

const SHERUT_DATA: Record<string, SherutData> = {
  SHR001: {
    title: 'בקשת חופשה',
    description: 'בקשה לאישור חופשה שנתית / חופשה מיוחדת. הבקשה עוברת תהליך אישור מדורג.',
    status: 'פתוח',
    category: 'ניהול זמן',
    currentStepIndex: 2,
    fields: [
      { label: 'תאריך התחלה', value: '15/05/2026' },
      { label: 'תאריך סיום', value: '22/05/2026' },
      { label: 'מספר ימים', value: '5' },
      { label: 'סוג חופשה', value: 'חופשה שנתית' },
    ],
  },
  SHR002: {
    title: 'אישור נסיעות',
    description: 'בקשה לאישור נסיעה לצרכי עבודה כולל החזר הוצאות נסיעה.',
    status: 'ממתין',
    category: 'נסיעות',
    currentStepIndex: 1,
    fields: [
      { label: 'יעד', value: 'תל אביב' },
      { label: 'תאריך', value: '20/05/2026' },
      { label: 'מטרה', value: 'פגישת לקוח' },
      { label: 'אמצעי תחבורה', value: 'רכב פרטי' },
    ],
  },
  SHR003: {
    title: 'עדכון פרטים אישיים',
    description: 'עדכון פרטי קשר ומידע אישי במערכת משאבי האנוש.',
    status: 'הושלם',
    category: 'פרטים אישיים',
    currentStepIndex: 4,
    fields: [
      { label: 'שדה לעדכון', value: 'כתובת מגורים' },
      { label: 'ערך חדש', value: 'רחוב הרצל 5, תל אביב' },
      { label: 'תאריך עדכון', value: '01/04/2026' },
      { label: 'אומת על ידי', value: 'מחלקת HR' },
    ],
  },
  SHR004: {
    title: 'בקשת ציוד משרדי',
    description: 'הזמנת ציוד משרדי או אביזרי מחשוב לצרכי עבודה.',
    status: 'פתוח',
    category: 'ציוד',
    currentStepIndex: 0,
    fields: [
      { label: 'פריט', value: "מסך מחשב 24 אינץ'" },
      { label: 'כמות', value: '1' },
      { label: 'סיבה', value: 'ציוד ישן' },
      { label: 'דחיפות', value: 'רגילה' },
    ],
  },
  SHR005: {
    title: 'דיווח שעות עבודה',
    description: 'דיווח חודשי על שעות עבודה ופירוט פרויקטים לחישוב שכר.',
    status: 'ממתין',
    category: 'שעות עבודה',
    currentStepIndex: 2,
    fields: [
      { label: 'תקופה', value: 'אפריל 2026' },
      { label: 'שעות לדווח', value: '176' },
      { label: 'מחלקה', value: 'IT' },
      { label: 'מנהל ממשיך', value: 'יוסי כהן' },
    ],
  },
};

const STATUS_STYLE = {
  'פתוח':  { bg: '#e8f0fe', color: '#1E3BA2' },
  'ממתין': { bg: '#fff8e1', color: '#b07a00' },
  'הושלם': { bg: '#e6f4ea', color: '#2d7a3a' },
};

const App: React.FC<Props> = ({ idntSheryut = '', employeeId = '' }) => {
  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null);

  // ❌ Wrong — async directly in useEffect
  useEffect(async () => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/1`);
    const json = await res.json();
    setFetchedTitle(json.title);
  }, [idntSheryut]);

  const data: SherutData = SHERUT_DATA[idntSheryut] ?? {
    title: `שירות ${idntSheryut || '—'}`,
    description: 'פרטי השירות לא נמצאו.',
    status: 'פתוח',
    category: 'כללי',
    currentStepIndex: 0,
    fields: [],
  };

  const statusStyle = STATUS_STYLE[data.status];

  const getStepState = (i: number): 'done' | 'current' | 'pending' => {
    if (data.currentStepIndex >= STEPS.length) return 'done';
    if (i < data.currentStepIndex) return 'done';
    if (i === data.currentStepIndex) return 'current';
    return 'pending';
  };


  

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Rubik, Arial, sans-serif' }}>

      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#00033D', fontSize: '20px', fontWeight: 600 }}>{data.title}</h2>
          <span style={{ fontSize: '12px', color: '#848282', marginTop: '4px', display: 'block' }}>{data.category}</span>
        </div>
        <span style={{
          fontSize: '13px',
          padding: '4px 14px',
          borderRadius: '20px',
          background: statusStyle.bg,
          color: statusStyle.color,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}>{data.status}</span>
      </div>

      {/* Description */}
      <p style={{
        color: '#444',
        fontSize: '14px',
        lineHeight: 1.6,
        margin: '0 0 24px',
        padding: '12px 16px',
        background: '#F8F9FD',
        borderRadius: '8px',
        borderRight: '3px solid #1E3BA2',
      }}>{data.description}</p>

      {/* Steps timeline */}
      <div style={{ marginBottom: '28px' }}>
        <h4 style={{ margin: '0 0 16px', color: '#1E3BA2', fontSize: '14px', fontWeight: 600 }}>שלבי תהליך</h4>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {STEPS.map((step, i) => {
            const state = getStepState(i);
            const isLast = i === STEPS.length - 1;
            return (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '64px' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: state === 'done' ? '#2d7a3a' : state === 'current' ? '#1E3BA2' : '#E8EAF0',
                    color: state === 'pending' ? '#848282' : '#fff',
                    outline: state === 'current' ? '3px solid #e8f0fe' : 'none',
                    outlineOffset: '1px',
                  }}>
                    {state === 'done' ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    marginTop: '6px',
                    textAlign: 'center',
                    color: state === 'done' ? '#2d7a3a' : state === 'current' ? '#1E3BA2' : '#848282',
                    fontWeight: state === 'current' ? 600 : 400,
                    maxWidth: '60px',
                    lineHeight: 1.3,
                  }}>{step}</span>
                </div>
                {!isLast && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: state === 'done' ? '#2d7a3a' : '#E8EAF0',
                    marginTop: '14px',
                    alignSelf: 'flex-start',
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Fields grid */}
      {data.fields.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ margin: '0 0 12px', color: '#1E3BA2', fontSize: '14px', fontWeight: 600 }}>פרטי הבקשה</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {data.fields.map((f, i) => (
              <div key={i} style={{
                padding: '12px 14px',
                background: '#F8F9FD',
                borderRadius: '8px',
                border: '1px solid #E8EAF0',
              }}>
                <div style={{ fontSize: '11px', color: '#848282', marginBottom: '4px' }}>{f.label}</div>
                <div style={{ fontSize: '14px', color: '#00033D', fontWeight: 500 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic federation debug badge */}
      <div style={{
        padding: '10px 14px',
        background: '#f0f4ff',
        borderRadius: '8px',
        border: '1px dashed #1E3BA2',
        fontSize: '11px',
        color: '#1E3BA2',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}>
        <span>🔌</span>
        <span>
          נטען דינמית: <strong>mfe-sherut-exemplat</strong> @ localhost:3005
          {' · '}idntSheryut: <strong>{idntSheryut || '—'}</strong>
          {employeeId && <>{' · '}employeeId: <strong>{employeeId}</strong></>}
          {' · '}fetched: <strong>{fetchedTitle ?? '...'}</strong>
        </span>
      </div>
    </div>
  );
};

export default App;
