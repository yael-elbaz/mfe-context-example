import React, { lazy, Suspense, useEffect } from 'react';

const SearchEmployeeMFE = lazy(() => import('mfe_search_employee/App'));

interface Props {
  onSelected: (idntEmployee: string) => void;
  onClose: () => void;
}

export const SelectEmployeePopup: React.FC<Props> = ({ onSelected, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '480px',
          maxWidth: '90vw',
          direction: 'rtl',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', left: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '20px', color: '#848282', lineHeight: 1,
          }}
        >✕</button>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1E3BA2', fontFamily: 'Rubik, sans-serif' }}>
          בחר עובד לפתיחת השירות
        </h3>
        <hr style={{ border: 'none', borderTop: '1px solid #E8EAF0', margin: '12px 0 20px' }} />
        <Suspense fallback={<div style={{ color: '#848282', fontSize: '14px' }}>טוען חיפוש עובד...</div>}>
          <SearchEmployeeMFE onSelected={onSelected} />
        </Suspense>
      </div>
    </div>
  );
};
