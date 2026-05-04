import React from 'react';
import type { OpenService } from './types';
import { MOCK_SHERUTIM } from './mockData';
import SherutimCard from './SherutimCard';

interface Props {
  openService?: OpenService;
  employeeId?: string;
}

const Full: React.FC<Props> = ({ openService, employeeId = '' }) => (
  <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
      <h2 style={{ margin: 0, color: '#1E3BA2', fontSize: '18px' }}>כל השירותים הדיגיטליים</h2>
      <button
        onClick={() => openService?.({ type: 'employee', employee: { id: employeeId } })}
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
          onClick={() => openService?.({
            type: 'sherut',
            employee: { id: employeeId },
            sherut: {
              idntSheryut: s.idntSheryut,
              mfeUrl:      s.mfeUrl,
              mfeScope:    s.mfeScope,
              mfeModule:   s.mfeModule,
            },
          })}
        />
      ))}
    </div>
  </div>
);

export default Full;
