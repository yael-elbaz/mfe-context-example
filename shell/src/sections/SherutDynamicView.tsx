import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
  /**
   * ה-route הוא ילד של digital-objects (…/digital-objects/sherutim/:id) — המקום של שירותי אוברליי.
   * אם ההגדרות לא תואמות ל-route (קישור ישן / משותף) — מפנים ל-route הנכון.
   */
  overlayRoute?: boolean;
  /** לשירות שנפתח כדף מלא */
  openService?: OpenService;
}

export const SherutDynamicView: React.FC<Props> = ({ portfolio, overlayRoute = false }) => {
  const { idntSheryut, '*': rest } = useParams<{ idntSheryut?: string; '*': string }>();
  const id = idntSheryut ?? '';
  const navigate = useNavigate();
  const location = useLocation();
  const person = useSelectedPerson();
  const mfeConfig = useSherutConfig(id);
  const root = portfolio ? `/${portfolio}-portfolio` : '';

  // דף מלא: חזרה לדף הבית של התיק. אוברליי: נשארים על האובייקטים הדיגיטליים (ההורה — לא נטען מחדש).
  // אותם פרמטרים בשני המקרים (employeeId / customerId / doSearch / q)
  const goBack = useCallback(
    () => navigate(
      !portfolio ? '/'
        : overlayRoute ? `${root}/digital-objects${location.search}`
        : `${root}${location.search}`,
    ),
    [navigate, portfolio, overlayRoute, root, location.search],
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

  // ההגדרות וה-route לא תואמים — מפנים, ומעבירים את ה-mfeConfig כדי לא לטעון שוב
  if (isOverlay !== overlayRoute && portfolio) {
    const tail = rest ? `/${rest}` : '';
    const to = `${root}${isOverlay ? '/digital-objects' : ''}/sherutim/${id}${tail}${location.search}`;
    return <Navigate to={to} replace state={{ ...(location.state as object | null), mfeConfig }} />;
  }

  return isOverlay ? (
    <SherutOverlayView
      serviceId={id}
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
