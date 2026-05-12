import React, { useState, useRef, useEffect } from 'react';
import { useUser } from 'shell/store';

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
}

const EMPLOYEES: Employee[] = [
  { id: '1001', name: 'דנה לוי', department: 'כספים', role: 'מנהלת חשבונות' },
  { id: '1002', name: 'יוסי כהן', department: 'HR', role: 'רכז גיוס' },
  { id: '1003', name: 'מיכל גולן', department: 'IT', role: 'מפתחת Full Stack' },
  { id: '1004', name: 'אבי שפירא', department: 'כספים', role: 'מנהל תקציב' },
  { id: '1005', name: 'רינת ברק', department: 'HR', role: 'מנהלת HR' },
  { id: '1006', name: 'נועם אלון', department: 'IT', role: 'ארכיטקט מערכות' },
  { id: '1007', name: 'שירה מזרחי', department: 'כספים', role: 'רואת חשבון' },
  { id: '1008', name: 'גל פרידמן', department: 'IT', role: 'מפתח Backend' },
];

interface Props {
  onSelected?: (idntEmployee: string) => void;
}

const App: React.FC<Props> = ({ onSelected }) => {
  const user = useUser();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? EMPLOYEES.filter(
        (e) =>
          e.id.includes(query.trim()) ||
          e.name.includes(query.trim())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelected(null);
    setOpen(true);
  };

  const handleSelect = (employee: Employee) => {
    setSelected(employee);
    setQuery(employee.id);
    setOpen(false);
    onSelected?.(employee.id);
  };

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
        <h2 style={{ margin: 0, color: '#1e3a5f' }}>🔍 חיפוש עובד</h2>
        {user && (
          <span style={{ fontSize: '13px', color: '#888' }}>
            מחובר כ: {user.email}
          </span>
        )}
      </div>

      <div ref={containerRef} style={{ position: 'relative', maxWidth: '400px' }}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="הכנס מספר עובד או שם..."
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #C5CBDD',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#00033D',
            direction: 'rtl',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {open && filtered.length > 0 && (
          <ul
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              left: 0,
              background: '#fff',
              border: '1px solid #C5CBDD',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              listStyle: 'none',
              margin: 0,
              padding: '4px 0',
              zIndex: 100,
              maxHeight: '240px',
              overflowY: 'auto',
            }}
          >
            {filtered.map((employee) => (
              <li
                key={employee.id}
                onClick={() => handleSelect(employee)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  direction: 'rtl',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F8F9FD')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontWeight: 500, color: '#00033D' }}>{employee.name}</span>
                <span style={{ fontSize: '12px', color: '#848282' }}>
                  {employee.id} · {employee.department}
                </span>
              </li>
            ))}
          </ul>
        )}

        {open && query.trim() && filtered.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              left: 0,
              background: '#fff',
              border: '1px solid #C5CBDD',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#848282',
              fontSize: '14px',
              direction: 'rtl',
            }}
          >
            לא נמצאו עובדים
          </div>
        )}
      </div>

      {selected && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            background: '#F8F9FD',
            borderRadius: '8px',
            direction: 'rtl',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '16px', color: '#1E3BA2', marginBottom: '8px' }}>
            {selected.name}
          </div>
          <div style={{ fontSize: '14px', color: '#848282', display: 'flex', gap: '16px' }}>
            <span>מס׳ עובד: {selected.id}</span>
            <span>מחלקה: {selected.department}</span>
            <span>תפקיד: {selected.role}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
