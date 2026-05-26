import React, { lazy, Suspense, useEffect } from 'react';
import type { EmployeePickerPopupProps } from '../hooks/useEmployeePickerPopup';

const SearchEmployeeMFE = lazy(() => import('mfe_search_employee/App'));

const EmployeePickerPopup: React.FC<EmployeePickerPopupProps> = ({ open, objectType, onSelected, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '400px',
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          direction: 'rtl',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '20px', color: '#666', lineHeight: 1,
          }}
          aria-label="סגור"
        >
          ✕
        </button>

        <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#1E3BA2' }}>
          בחר אדם לפתיחת השירות
        </h3>

        <Suspense fallback={<div style={{ padding: '16px', color: '#888' }}>טוען חיפוש עובד...</div>}>
          <SearchEmployeeMFE onSelected={onSelected} objectType={objectType} />
        </Suspense>
      </div>
    </div>
  );
};

export default EmployeePickerPopup;
