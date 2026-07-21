import React from 'react';
import './index.css';
import type { OpenService } from './types';
import { useSherutim } from './hooks/useSherutim';
import SherutimCard from './SherutimCard';

interface Props {
  openService?: OpenService;
  employeeId?: string;
  onShowAll?: () => void;
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

const Preview: React.FC<Props> = ({ openService, employeeId = '', onShowAll }) => {
  // הרשימה מגיעה מה-store המשותף (fetch פעם אחת) — כך שמעבר ל"הצג הכל" לא טוען שוב.
  const { sherutim } = useSherutim();

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
        <h3 style={{ margin: 0, color: '#1E3BA2', fontSize: '16px' }}>שירותים דיגיטליים</h3>
        {onShowAll && (
          <button
            onClick={() => onShowAll()}
            style={{ background: 'none', border: '1px solid #1E3BA2', color: '#1E3BA2', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}
          >
            הצג הכל
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {sherutim.slice(0, 3).map(s => (
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
};

export default Preview;
