import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useSelectedPerson } from '../store/personStore';
import type { SherutMfeConfig } from '../services/sherutimService';
import { loadRemoteModule } from '../utils/dynamicFederation';

type Phase = 'module' | 'done' | 'error';
type OutletCtx = { mfeConfig: SherutMfeConfig };

class MFEErrorBoundary extends React.Component<
  { children: React.ReactNode; onBack: () => void },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '24px', background: '#fff0f0', borderRadius: '8px', direction: 'rtl' }}>
          <strong>❌ שגיאה בטעינת השירות</strong>
          <p style={{ fontSize: '13px', marginTop: '8px', color: '#666' }}>
            המודול החיצוני השתמש ב-async useEffect או נכשל בזמן ריצה.
          </p>
          <button
            onClick={this.props.onBack}
            style={{ background: 'none', border: '1px solid #C5CBDD', color: '#00033D', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px', marginTop: '12px' }}
          >
            ← חזרה
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Dot: React.FC<{ state: 'active' | 'done' | 'pending'; label: string }> = ({ state, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', direction: 'rtl' }}>
    <span style={{
      fontSize: '16px',
      width: '20px',
      textAlign: 'center',
      color: state === 'done' ? '#2d7a3a' : state === 'active' ? '#1E3BA2' : '#C5CBDD',
    }}>
      {state === 'done' ? '✓' : state === 'active' ? '⏳' : '○'}
    </span>
    <span style={{
      fontSize: '13px',
      color: state === 'done' ? '#2d7a3a' : state === 'active' ? '#1E3BA2' : '#C5CBDD',
      fontWeight: state === 'active' ? 600 : 400,
    }}>{label}</span>
  </div>
);

export const SherutDynamicView: React.FC = () => {
  const { idntSheryut } = useParams<{ idntSheryut?: string }>();
  const id = idntSheryut ?? '';
  const navigate = useNavigate();
  const person = useSelectedPerson();
  const { mfeConfig } = useOutletContext<OutletCtx>();


  const goBack = () => navigate(person?.id ? `/employee-portfolio?employeeId=${person.id}` : '/');

  const [phase, setPhase] = useState<Phase>('module');
  const [DynamicComponent, setDynamicComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSherut = useCallback(async (signal: { cancelled: boolean }) => {
    try {
      setPhase('module');
      const Component = await loadRemoteModule(mfeConfig.remoteUrl, mfeConfig.module, mfeConfig.scope);
      if (signal.cancelled) return;
      setDynamicComponent(() => Component);
      setPhase('done');
    } catch (err) {
      if (!signal.cancelled) {
        setError((err as Error).message);
        setPhase('error');
      }
    }
  }, [mfeConfig]);

  useEffect(() => {
    if (!id) return;
    const signal = { cancelled: false };
    loadSherut(signal);
    return () => { signal.cancelled = true; };
  }, [loadSherut]);

  if (phase === 'error') {
    return (
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', direction: 'rtl' }}>
        <button
          onClick={goBack}
          style={{ background: 'none', border: '1px solid #C5CBDD', color: '#00033D', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px', marginBottom: '16px' }}
        >
          ← חזרה
        </button>
        <div style={{ padding: '16px', background: '#fff0f0', borderRadius: '8px', color: '#c00' }}>
          <strong>שגיאה בטעינת השירות</strong>
          <pre style={{ fontSize: '12px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      </div>
    );
  }

  if (phase !== 'done' || !DynamicComponent) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '48px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        direction: 'rtl',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E8EAF0',
          borderTop: '3px solid #1E3BA2',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#1E3BA2', fontWeight: 600, fontSize: '15px', margin: 0 }}>טוען שירות...</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignSelf: 'stretch', maxWidth: '280px' }}>
          <Dot state={phase === 'module' ? 'active' : 'done'} label="טוען מודול MFE" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', direction: 'rtl' }}>
        <button
          onClick={goBack}
          style={{ background: 'none', border: '1px solid #C5CBDD', color: '#00033D', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}
        >
          ← חזרה לרשימת השירותים
        </button>
      </div>
      <MFEErrorBoundary onBack={goBack}>
        <DynamicComponent idntSheryut={id} employeeId={person?.id ?? ''} />
      </MFEErrorBoundary>
    </div>
  );
};
