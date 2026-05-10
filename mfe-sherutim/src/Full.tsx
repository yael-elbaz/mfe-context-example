import React from 'react';
import type { OpenService } from './types';
import { MOCK_SHERUTIM } from './mockData';
import SherutimCard from './SherutimCard';

interface Props {
  openService?: OpenService;
  employeeId?: string;
}

function param(key: string, value: string) {
  return { codeSugParameter: '', parameterKey: key, parameterValue: value };
}

function makeCall(params: Record<string, string>, url?: string) {
  return {
    codeSugObject: 0, textMenuItem: '', kamutknisot: 0, isFavorite: false,
    logiPnimi: false, openInIe: false, logiSugObjectMismach: false,
    categoryId: '', idntObject: 0, idntMenuItemAv: 0, idntMenuItem: 0,
    textNativ: '', textMenu: '', textMenuTarget: '', idntMaarechet: 0,
    url,
    menuParamsList: Object.entries(params).map(([k, v]) => param(k, v)),
  };
}

const Full: React.FC<Props> = ({ openService, employeeId = '' }) => (
  <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
      <h2 style={{ margin: 0, color: '#1E3BA2', fontSize: '18px' }}>כל השירותים הדיגיטליים</h2>
      <button
        onClick={() => openService?.(makeCall({ type: 'employee', id: employeeId }))}
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
          onClick={() => openService?.(makeCall(
            { type: 'sherut', id: employeeId, idntSheryut: s.idntSheryut, scope: s.mfeScope, module: s.mfeModule },
            s.mfeUrl
          ))}
        />
      ))}
    </div>
  </div>
);

export default Full;
