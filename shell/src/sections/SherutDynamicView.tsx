import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelectedPerson } from '../store/personStore';
import { getSherutMfeConfig, type SherutMfeConfig } from '../services/sherutimService';
import { loadRemoteModule } from '../utils/dynamicFederation';
import SherutOverlayView from '../components/overlay/SherutOverlayView';
import SherutPageView, { type Phase } from './SherutPageView';
import type { OpenService } from '../types/openService';

/**
 * הגדרות השירות: מה-state של הניווט (openService), ואם אין — קישור ישיר / רענון — מה-API.
 * כוללות גם את הגדרות התצוגה (displaySettings / overlaySize / title).
 */
function useSherutConfig(id: string): SherutMfeConfig | null {
  const location = useLocation();
  const fromState = (location.state as { mfeConfig?: SherutMfeConfig } | null)?.mfeConfig ?? null;
  const [fetched, setFetched] = useState<SherutMfeConfig | null>(null);

  useEffect(() => {
    if (fromState || !id) return;
    let cancelled = false;
    setFetched(null);
    getSherutMfeConfig(id).then((c) => { if (!cancelled) setFetched(c); });
    return () => { cancelled = true; };
  }, [id, fromState]);

  return fromState ?? fetched;
}

interface Props {
  /** התיק שה-route נמצא בתוכו. בלי תיק — השירות תמיד נפתח כדף מלא, גם אם הוגדר כאוברליי */
  portfolio?: 'employee' | 'customer';
  /** לאובייקטים הדיגיטליים שמתחת לאוברליי — יכולים לפתוח שירות */
  openService?: OpenService;
}

export const SherutDynamicView: React.FC<Props> = ({ portfolio, openService }) => {
  const { idntSheryut } = useParams<{ idntSheryut?: string }>();
  const id = idntSheryut ?? '';
  const navigate = useNavigate();
  const location = useLocation();
  const person = useSelectedPerson();
  const mfeConfig = useSherutConfig(id);

  // חזרה / סגירה — לדף הבית של התיק, עם אותם פרמטרים (employeeId / customerId)
  const goBack = useCallback(
    () => navigate(portfolio ? `/${portfolio}-portfolio${location.search}` : '/'),
    [navigate, portfolio, location.search],
  );

  const [phase, setPhase] = useState<Phase>('module');
  const [DynamicComponent, setDynamicComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSherut = useCallback(async (signal: { cancelled: boolean }) => {
    if (!mfeConfig) return;
    try {
      setPhase('module');
      const Component = await loadRemoteModule(mfeConfig.remoteUrl, mfeConfig.module);
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

  if (!mfeConfig) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#1E3BA2', direction: 'rtl' }}>⏳ טוען הגדרות שירות...</div>;
  }

  // אוברליי — רק בתוך תיק: האובייקטים הדיגיטליים מתחת, השירות בחלון צף מעליהם. אחרת — דף מלא.
  const isOverlay = mfeConfig.displaySettings === 'overlay' && !!portfolio;

  return isOverlay ? (
    <SherutOverlayView
      serviceId={id}
      portfolio={portfolio!}
      openService={openService}
      title={mfeConfig.title ?? ''}
      initialSize={mfeConfig.overlaySize ?? 'm'}
      Component={phase === 'done' ? DynamicComponent : null}
      error={phase === 'error' ? error : null}
      serviceProps={{ idntSheryut: id, employeeId: person?.id ?? '' }}
      onClose={goBack}
    />
  ) : (
    <SherutPageView
      phase={phase}
      error={error}
      Component={DynamicComponent}
      idntSheryut={id}
      employeeId={person?.id ?? ''}
      onBack={goBack}
    />
  );
};
