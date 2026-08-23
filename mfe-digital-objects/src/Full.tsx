import React, { useState } from 'react';
import { useEmployee } from 'shell/employeeStore';
import { MOCK_OBJECTS, STATUS_STYLE, DigitalObject, ObjectType } from './shared';
import { useIframeFocusEvent } from './useIframeFocusEvent';

interface Props {
  employeeId?: string;
  navigate?: (to: string) => void;
  onFocusItem?: (id: string, iframeUrl?: string) => void;
}

// דמו בלבד: URL להטמעה מקומית ב-iframe, במקום ה-URL האמיתי מאירוע ה-iframe.
const demoUrl = (obj: DigitalObject) =>
  'data:text/html;charset=utf-8,' +
  encodeURIComponent(
    `<html dir="rtl"><body style="font-family:sans-serif;padding:24px;color:#00033D">` +
      `<h2>${obj.name}</h2><p>תצוגת iframe חיצונית לדוגמה · ${obj.type}</p>` +
      `<p style="color:#848282">${obj.details}</p></body></html>`
  );

const TYPE_FILTERS: Array<ObjectType | 'הכל'> = ['הכל', 'ציוד', 'רישיון תוכנה', 'הרשאת מערכת'];

const ObjectRow: React.FC<{ obj: DigitalObject; onFocus?: () => void }> = ({ obj, onFocus }) => {
  const s = STATUS_STYLE[obj.status];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 140px 120px 90px auto',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      background: '#F8F9FD',
      direction: 'rtl',
    }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#00033D' }}>{obj.name}</div>
        <div style={{ fontSize: '12px', color: '#848282', marginTop: '2px' }}>{obj.details}</div>
      </div>
      <div style={{ fontSize: '13px', color: '#444' }}>{obj.type}</div>
      <div style={{ fontSize: '12px', color: '#848282' }}>הוקצה: {obj.assignedDate}</div>
      <span style={{
        fontSize: '11px',
        padding: '3px 10px',
        borderRadius: '12px',
        background: s.bg,
        color: s.color,
        textAlign: 'center',
      }}>{obj.status}</span>
      <button
        onClick={onFocus}
        style={{ background: 'none', border: '1px solid #1E3BA2', color: '#1E3BA2', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}
      >
        התמקד
      </button>
    </div>
  );
};

const Full: React.FC<Props> = ({ employeeId, navigate, onFocusItem }) => {
  const employee = useEmployee();

  // בסביבה האמיתית: ה-URL מגיע מאירוע ה-iframe ונשלח הלאה אל ה-Detail.
  useIframeFocusEvent(onFocusItem);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ObjectType | 'הכל'>('הכל');

  if (!employee) return null;

  const filtered = MOCK_OBJECTS.filter(o => {
    const matchSearch = !search || o.name.includes(search) || o.details.includes(search) || o.type.includes(search);
    const matchType = typeFilter === 'הכל' || o.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
        <h2 style={{ margin: 0, color: '#1E3BA2', fontSize: '18px' }}>
          אובייקטים דיגיטליים — {employee.firstName} {employee.lastName}
        </h2>
        <button
          onClick={() => navigate?.(`/employee-portfolio?employeeId=${employeeId ?? employee.id}`)}
          style={{ background: 'none', border: '1px solid #C5CBDD', color: '#00033D', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}
        >
          ← חזרה
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', direction: 'rtl', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם, סוג או פרטים..."
          style={{
            flex: '1',
            minWidth: '200px',
            padding: '9px 14px',
            border: '1px solid #C5CBDD',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#00033D',
            direction: 'rtl',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '6px' }}>
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: typeFilter === t ? '#01278C' : '#C5CBDD',
                background: typeFilter === t ? '#4395FF' : '#fff',
                color: typeFilter === t ? '#fff' : '#00033D',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >{t}</button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 140px 120px 90px auto',
        padding: '6px 16px',
        fontSize: '11px',
        color: '#848282',
        direction: 'rtl',
        gap: '12px',
      }}>
        <span>שם</span>
        <span>סוג</span>
        <span>תאריך הקצאה</span>
        <span>סטטוס</span>
        <span />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filtered.length === 0
          ? <div style={{ textAlign: 'center', color: '#848282', fontSize: '14px', padding: '32px' }}>לא נמצאו פריטים</div>
          : filtered.map(obj => <ObjectRow key={obj.id} obj={obj} onFocus={() => onFocusItem?.(obj.id, demoUrl(obj))} />)
        }
      </div>

      <div style={{ textAlign: 'left', marginTop: '12px', fontSize: '12px', color: '#848282', direction: 'rtl' }}>
        סה״כ: {filtered.length} פריטים
      </div>
    </div>
  );
};

export default Full;
