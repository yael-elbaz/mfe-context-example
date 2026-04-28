import React, { useState } from 'react';
import { useEmployee } from 'shell/employeeStore';
import { MOCK_OBJECTS, STATUS_STYLE, DigitalObject } from './shared';

const navigate = (path: string) =>
  window.dispatchEvent(new CustomEvent('mfe:navigate', { detail: path }));

const ObjectRow: React.FC<{ obj: DigitalObject }> = ({ obj }) => {
  const s = STATUS_STYLE[obj.status];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 12px',
      borderRadius: '8px',
      background: '#F8F9FD',
      direction: 'rtl',
    }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#00033D' }}>{obj.name}</div>
        <div style={{ fontSize: '11px', color: '#848282', marginTop: '2px' }}>{obj.type} · {obj.assignedDate}</div>
      </div>
      <div style={{ fontSize: '11px', color: '#848282', whiteSpace: 'nowrap' }}>{obj.details}</div>
      <span style={{
        fontSize: '11px',
        padding: '2px 10px',
        borderRadius: '12px',
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}>{obj.status}</span>
    </div>
  );
};

const Preview: React.FC = () => {
  const employee = useEmployee();
  const [search, setSearch] = useState('');

  if (!employee) return null;

  const filtered = MOCK_OBJECTS.filter(o =>
    o.name.includes(search) || o.type.includes(search) || o.details.includes(search)
  );
  const preview = filtered.slice(0, 3);

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', direction: 'rtl' }}>
        <h3 style={{ margin: 0, color: '#1E3BA2', fontSize: '16px' }}>אובייקטים דיגיטליים</h3>
        <button
          onClick={() => navigate(`/employee-portfolio/digital-objects?employeeId=${employee.id}`)}
          style={{ background: 'none', border: '1px solid #1E3BA2', color: '#1E3BA2', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}
        >
          הצג הכל
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="חיפוש..."
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #C5CBDD',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#00033D',
          direction: 'rtl',
          outline: 'none',
          boxSizing: 'border-box',
          marginBottom: '10px',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {preview.length === 0
          ? <div style={{ textAlign: 'center', color: '#848282', fontSize: '13px', padding: '12px' }}>לא נמצאו תוצאות</div>
          : preview.map(obj => <ObjectRow key={obj.id} obj={obj} />)
        }
      </div>

      {filtered.length > 3 && (
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#848282' }}>
          ועוד {filtered.length - 3} פריטים נוספים
        </div>
      )}
    </div>
  );
};

export default Preview;
