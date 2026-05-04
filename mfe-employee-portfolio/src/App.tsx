import React from 'react';
import { useEmployee, useEmployeeLoading } from 'shell/employeeStore';

interface Props {
  openService?: (meta: Record<string, any>) => void;
}

const App: React.FC<Props> = ({ openService }) => {
  const employee = useEmployee();
  const loading = useEmployeeLoading();

  const handleBack = () => {
    openService?.({ type: 'home', nav: { target: 'home' } });
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#888' }}>
        ⏳ טוען פרופיל עובד...
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#c00' }}>
        עובד לא נמצא
        <br />
        <button onClick={handleBack} style={{ marginTop: '16px', cursor: 'pointer', color: '#1E3BA2', background: 'none', border: 'none' }}>
          ← חזרה לחיפוש
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      direction: 'rtl',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      <button
        onClick={handleBack}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#1E3BA2',
          fontSize: '13px',
          padding: 0,
        }}
      >
        ← חזרה לדף הבית
      </button>

      <img
        src={employee.image}
        alt={`${employee.firstName} ${employee.lastName}`}
        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
      />

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 4px', color: '#1E3BA2', fontSize: '18px' }}>
          {employee.firstName} {employee.lastName}
        </h2>
        <div style={{ color: '#848282', fontSize: '13px' }}>
          {employee.role} · {employee.department}
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { label: 'מספר עובד', value: employee.id },
          { label: 'יחידה', value: employee.unit },
          { label: 'ותק בחברה', value: `${employee.yearsInCompany} שנים` },
          { label: 'מחלקה', value: employee.department },
          { label: 'אימייל', value: employee.email },
          { label: 'טלפון', value: employee.phone },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#F8F9FD', borderRadius: '8px', padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', color: '#848282', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontSize: '13px', color: '#00033D', fontWeight: 500, wordBreak: 'break-word' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '12px', color: '#848282', marginBottom: '8px' }}>כישורים</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {employee.skills.map((skill) => (
            <span key={skill} style={{
              background: '#EEF2FF',
              color: '#1E3BA2',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '12px',
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
