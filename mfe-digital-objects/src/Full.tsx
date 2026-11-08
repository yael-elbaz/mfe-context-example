import React, { useState } from 'react';
import { useEmployee } from 'shell/employeeStore';
import { MOCK_OBJECTS, STATUS_STYLE, DigitalObject, ObjectType, ObjectStatus, DigitalObjectsPreviewState } from './shared';
import { useIframeFocusEvent } from './useIframeFocusEvent';
import SectionCard from 'shell/SectionCard';
import FilterButton from './FilterButton';

interface Props {
  employeeId?: string;
  // "חזרה" — ה-shell מחליט לאן חוזרים (תיק העובד)
  backToPreview?: () => void;
  onFocusItem?: (id: string, iframeUrl?: string) => void;
  // ה-state שה-Preview העביר ב-onShowAll (למשל { filtersOpen: true } מכפתור "סינון מורחב")
  previewState?: DigitalObjectsPreviewState;
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
const STATUSES: ObjectStatus[] = ['פעיל', 'בבדיקה', 'מנוטרל'];
// assignedDate בפורמט MM/YYYY
const yearOf = (o: DigitalObject) => o.assignedDate.split('/')[1];
const YEARS = Array.from(new Set(MOCK_OBJECTS.map(yearOf))).sort().reverse();

const filterLabelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 500, color: '#00033D', marginBottom: '8px' };
const optionStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#00033D', cursor: 'pointer' };

interface FilterBarProps {
  typeFilter: ObjectType | 'הכל';
  setTypeFilter: (t: ObjectType | 'הכל') => void;
  statuses: ObjectStatus[];
  toggleStatus: (s: ObjectStatus) => void;
  year: string;
  setYear: (y: string) => void;
  onReset: () => void;
  onClose: () => void;
}

/** סרגל סינון מורחב — 20% מרוחב המקטע, לכל גובהו */
const FilterBar: React.FC<FilterBarProps> = ({ typeFilter, setTypeFilter, statuses, toggleStatus, year, setYear, onReset, onClose }) => (
  <aside style={{
    flex: '0 0 20%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '16px',
    borderRadius: '8px',
    background: '#F8F9FD',
    boxSizing: 'border-box',
    direction: 'rtl',
    // אם הגובה קטן מתוכן הסרגל — גלילה בתוך הסרגל
    overflowY: 'auto',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ margin: 0, color: '#1E3BA2', fontSize: '16px' }}>סינון מורחב</h3>
      <button
        onClick={onClose}
        aria-label="סגירת סינון"
        style={{ background: 'none', border: 'none', color: '#00033D', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
      >×</button>
    </div>

    <div>
      <div style={filterLabelStyle}>סוג</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {TYPE_FILTERS.map(t => (
          <label key={t} style={optionStyle}>
            <input type="radio" name="do-type" checked={typeFilter === t} onChange={() => setTypeFilter(t)} />
            {t}
          </label>
        ))}
      </div>
    </div>

    <div>
      <div style={filterLabelStyle}>סטטוס</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {STATUSES.map(st => (
          <label key={st} style={optionStyle}>
            <input type="checkbox" checked={statuses.includes(st)} onChange={() => toggleStatus(st)} />
            {st}
          </label>
        ))}
      </div>
    </div>

    <div>
      <div style={filterLabelStyle}>שנת הקצאה</div>
      <select
        value={year}
        onChange={e => setYear(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #C5CBDD', borderRadius: '8px', background: '#fff', fontSize: '13px', color: '#00033D', direction: 'rtl' }}
      >
        <option value="">הכל</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>

    <button
      onClick={onReset}
      style={{ marginTop: 'auto', background: '#fff', border: '1px solid #C5CBDD', color: '#00033D', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}
    >
      ניקוי סינון
    </button>
  </aside>
);

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

const Full: React.FC<Props> = ({ backToPreview, onFocusItem, previewState }) => {
  const employee = useEmployee();

  // בסביבה האמיתית: ה-URL מגיע מאירוע ה-iframe ונשלח הלאה אל ה-Detail.
  useIframeFocusEvent(onFocusItem);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ObjectType | 'הכל'>('הכל');
  const [statuses, setStatuses] = useState<ObjectStatus[]>([]);
  const [year, setYear] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(!!previewState?.filtersOpen);

  if (!employee) return null;

  const filtered = MOCK_OBJECTS.filter(o => {
    const matchSearch = !search || o.name.includes(search) || o.details.includes(search) || o.type.includes(search);
    const matchType = typeFilter === 'הכל' || o.type === typeFilter;
    const matchStatus = statuses.length === 0 || statuses.includes(o.status);
    const matchYear = !year || yearOf(o) === year;
    return matchSearch && matchType && matchStatus && matchYear;
  });

  return (
    <SectionCard
      title={`אובייקטים דיגיטליים — ${employee.firstName} ${employee.lastName}`}
      count={filtered.length}
      countLabel="פריטים"
      backToPreview={backToPreview}
    >
      {/* סרגל הסינון לא מכסה את הנתונים — הוא תופס 20% בצד ימין והתוכן נדחף ל-80% שנותרו */}
      {/* ממלא את הגובה שנשאר בכרטיס (minHeight: 0 מאפשר להתכווץ) — רק רשימת הפריטים גוללת */}
      <div style={{ width: '100%', flex: '1 1 0', minHeight: 0, display: 'flex', gap: '16px', direction: 'rtl' }}>
      {filtersOpen && (
        <FilterBar
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statuses={statuses}
          toggleStatus={st => setStatuses(prev => prev.includes(st) ? prev.filter(x => x !== st) : [...prev, st])}
          year={year}
          setYear={setYear}
          onReset={() => { setTypeFilter('הכל'); setStatuses([]); setYear(''); }}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      <div style={{ flex: '1 1 0', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', direction: 'rtl', flexWrap: 'wrap', flexShrink: 0 }}>
        <FilterButton active={filtersOpen} onClick={() => setFiltersOpen(o => !o)} />
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
        flexShrink: 0,
      }}>
        <span>שם</span>
        <span>סוג</span>
        <span>תאריך הקצאה</span>
        <span>סטטוס</span>
        <span />
      </div>

      {/* אזור הגלילה היחיד במצב מלא */}
      <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filtered.length === 0
          ? <div style={{ textAlign: 'center', color: '#848282', fontSize: '14px', padding: '32px' }}>לא נמצאו פריטים</div>
          : filtered.map(obj => <ObjectRow key={obj.id} obj={obj} onFocus={() => onFocusItem?.(obj.id, demoUrl(obj))} />)
        }
      </div>
      </div>
      </div>
    </SectionCard>
  );
};

export default Full;
