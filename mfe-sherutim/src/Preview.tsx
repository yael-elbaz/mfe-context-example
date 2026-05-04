import React from 'react';
import type { OpenService } from './types';
import { MOCK_SHERUTIM } from './mockData';
import SherutimCard from './SherutimCard';

interface Props {
  openService?: OpenService;
  employeeId?: string;
}

const Preview: React.FC<Props> = ({ openService, employeeId = '' }) => (
  <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
      <h3 style={{ margin: 0, color: '#1E3BA2', fontSize: '16px' }}>שירותים דיגיטליים</h3>
      <button
        onClick={() => openService?.({ type: 'section', nav: { sectionId: 'sherutim', employeeId } })}
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

export default Preview;
