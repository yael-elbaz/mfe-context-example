import React from 'react';
import { useEmployee, useEmployeeLoading } from 'shell/employeeStore';

const App: React.FC = () => {
  const employee = useEmployee();
  const loading = useEmployeeLoading();

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('mfe:navigate', { detail: '/' }));
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
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        direction: 'rtl',
        maxWidth: '720px',
      }}
    >
      <button
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#1E3BA2',
          fontSize: '14px',
          marginBottom: '24px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        ← חזרה לחיפוש
      </button>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <img
          src={employee.image}
          alt={`${employee.firstName} ${employee.lastName}`}
          style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 4px', color: '#1E3BA2', fontSize: '22px' }}>
            {employee.firstName} {employee.lastName}
          </h2>
          <div style={{ color: '#848282', fontSize: '14px', marginBottom: '16px' }}>
            {employee.role} · {employee.department}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'מספר עובד', value: employee.id },
              { label: 'יחידה', value: employee.unit },
              { label: 'ותק בחברה', value: `${employee.yearsInCompany} שנים` },
              { label: 'מחלקה', value: employee.department },
              { label: 'אימייל', value: employee.email },
              { label: 'טלפון', value: employee.phone },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#F8F9FD', borderRadius: '8px', padding: '10px 14px' }}>
                <div style={{ fontSize: '11px', color: '#848282', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '14px', color: '#00033D', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: '13px', color: '#848282', marginBottom: '8px' }}>כישורים</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {employee.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    background: '#EEF2FF',
                    color: '#1E3BA2',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '13px',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
