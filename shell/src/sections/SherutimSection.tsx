import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const MOCK_SHERUTIM = [
  { id: 's1', idntSheryut: 'SHR001', title: 'בקשת חופשה', status: 'פתוח' },
  { id: 's2', idntSheryut: 'SHR002', title: 'אישור נסיעות', status: 'ממתין' },
  { id: 's3', idntSheryut: 'SHR003', title: 'עדכון פרטים אישיים', status: 'הושלם' },
  { id: 's4', idntSheryut: 'SHR004', title: 'בקשת ציוד משרדי', status: 'פתוח' },
  { id: 's5', idntSheryut: 'SHR005', title: 'דיווח שעות עבודה', status: 'ממתין' },
];

const SherutimCard: React.FC<{ title: string; status: string; onClick: () => void }> = ({ title, status, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: '20px 16px',
      borderRadius: '12px',
      border: '1px solid #C5CBDD',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      direction: 'rtl',
      minWidth: '120px',
      flex: '1 1 120px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'box-shadow 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)')}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
  >
    <span style={{ fontWeight: 500, color: '#00033D', fontSize: '14px' }}>{title}</span>
    <span style={{
      fontSize: '11px',
      padding: '2px 10px',
      borderRadius: '12px',
      background: status === 'הושלם' ? '#e6f4ea' : status === 'פתוח' ? '#e8f0fe' : '#fff8e1',
      color: status === 'הושלם' ? '#2d7a3a' : status === 'פתוח' ? '#1E3BA2' : '#b07a00',
    }}>{status}</span>
  </div>
);

export const SherutimPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const navigate = useNavigate();

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
        <h3 style={{ margin: 0, color: '#1E3BA2', fontSize: '16px' }}>שירותים דיגיטליים</h3>
        <button
          onClick={() => navigate(`/employee-portfolio/sherutim?employeeId=${employeeId}`)}
          style={{ background: 'none', border: '1px solid #1E3BA2', color: '#1E3BA2', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}
        >
          הצג הכל
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {MOCK_SHERUTIM.slice(0, 3).map(s => (
          <SherutimCard
            key={s.id}
            title={s.title}
            status={s.status}
            onClick={() => navigate(`/employee-portfolio/tik-asir/sherutim/${s.idntSheryut}?employeeId=${employeeId}`)}
          />
        ))}
      </div>
    </div>
  );
};

export const SherutimFull: React.FC = () => {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const navigate = useNavigate();

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
        <h2 style={{ margin: 0, color: '#1E3BA2', fontSize: '18px' }}>כל השירותים הדיגיטליים</h2>
        <button
          onClick={() => navigate(`/employee-portfolio?employeeId=${employeeId}`)}
          style={{ background: 'none', border: '1px solid #C5CBDD', color: '#00033D', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}
        >
          ← חזרה
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {MOCK_SHERUTIM.map(s => (
          <SherutimCard
            key={s.id}
            title={s.title}
            status={s.status}
            onClick={() => navigate(`/employee-portfolio/tik-asir/sherutim/${s.idntSheryut}?employeeId=${employeeId}`)}
          />
        ))}
      </div>
    </div>
  );
};
