import React from 'react';
import { useUser, useAppContext } from '../store/appContext';
import { UnitSelector } from './UnitSelector';

export const Header: React.FC = () => {
  const user = useUser();
  const logout = useAppContext((s) => s.logout);

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        background: '#1e3a5f',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '18px' }}>🖥️ שולחן עבודה ארגוני</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <UnitSelector />

        {user && (
          <span style={{ fontSize: '14px' }}>
            שלום, <strong>{user.name}</strong>
          </span>
        )}

        <button
          onClick={logout}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.4)',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          התנתק
        </button>
      </div>
    </header>
  );
};
