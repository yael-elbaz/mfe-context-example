import React, { useEffect, useRef, useState } from 'react';
import type { ServiceOverlayProps } from '../../hooks/useServiceOverlay';
import type { OverlaySize } from '../../types/openService';
import { loadRemoteModule } from '../../utils/dynamicFederation';
import { useSelectedPerson } from '../../store/personStore';

// מידות זמניות עד שיגיע עיצוב ב-Figma. תמיד מוגבל לגודל המסך פחות 24px מכל צד.
const SIZE_CLASS: Record<OverlaySize, string> = {
  s: 'w-[400px] h-[480px]',
  m: 'w-[640px] h-[600px]',
  l: 'w-[960px] h-[800px]',
};

class OverlayErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div className="rounded-lg bg-[#fff0f0] p-4 text-sm text-[#c00]">שגיאה בהרצת השירות</div>;
    }
    return this.props.children;
  }
}

/**
 * חלון השירות באוברליי: נפתח בפינה השמאלית התחתונה, מעל רקע שקוף שחוסם לחיצות על הדף.
 * שלב 1 — חלון קבוע (בלי גרירה ובלי מתג גודל; אלה בשלב 2).
 */
const ServiceOverlay: React.FC<ServiceOverlayProps> = ({ service, blockedNotice, onDismissNotice, onClose }) => {
  const person = useSelectedPerson();
  const windowRef = useRef<HTMLDivElement>(null);
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // טעינת ה-MFE של השירות
  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    setComponent(null);
    setError(null);
    loadRemoteModule(service.mfeConfig.remoteUrl, service.mfeConfig.module)
      .then(C => { if (!cancelled) setComponent(() => C); })
      .catch(err => { if (!cancelled) setError((err as Error).message); });
    return () => { cancelled = true; };
  }, [service]);

  // פוקוס נכנס לחלון בפתיחה וחוזר לאלמנט שפתח אותו בסגירה; Esc סוגר
  useEffect(() => {
    if (!service) return;
    const opener = document.activeElement as HTMLElement | null;
    windowRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [service, onClose]);

  if (!service) return null;

  return (
    <>
      {/* רקע שקוף לגמרי — רק חוסם לחיצות על הדף, ההדר והתפריט */}
      <div className="fixed inset-0 z-[500]" aria-hidden="true" />

      <div
        ref={windowRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-overlay-title"
        tabIndex={-1}
        dir="rtl"
        className={`fixed bottom-6 left-6 z-[501] flex max-h-[calc(100vh_-_48px)] max-w-[calc(100vw_-_48px)] flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] outline-none ${SIZE_CLASS[service.size]}`}
      >
        {/* שורת כותרת */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3">
          <h2 id="service-overlay-title" className="m-0 truncate text-base font-medium text-blue-heading">
            {service.title || 'שירות'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-xl leading-none text-[#00033D] hover:bg-[#F8F9FD]"
          >
            ×
          </button>
        </div>

        {/* "יש לסגור קודם" — כשמנסים לפתוח אוברליי נוסף מתוך השירות */}
        {blockedNotice && (
          <div role="alert" className="flex shrink-0 items-center justify-between gap-3 bg-[#FFF8E1] px-4 py-2 text-sm text-[#7A5500]">
            <span>יש לסגור קודם את השירות הפתוח</span>
            <button
              type="button"
              onClick={onDismissNotice}
              aria-label="סגירת ההודעה"
              className="cursor-pointer border-none bg-transparent text-base leading-none text-[#7A5500]"
            >
              ×
            </button>
          </div>
        )}

        {/* גוף — השירות ממלא את הגובה וגולל בפנים */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {error ? (
            <div className="rounded-lg bg-[#fff0f0] p-4 text-sm text-[#c00]">
              <strong>שגיאה בטעינת השירות</strong>
              <pre className="mt-2 whitespace-pre-wrap text-xs">{error}</pre>
            </div>
          ) : !Component ? (
            <div className="p-12 text-center text-blue-heading">⏳ טוען שירות...</div>
          ) : (
            <OverlayErrorBoundary>
              <Component
                {...service.params}
                idntSheryut={service.serviceId}
                employeeId={person?.id ?? ''}
                displayMode="overlay"
                onClose={onClose}
              />
            </OverlayErrorBoundary>
          )}
        </div>
      </div>
    </>
  );
};

export default ServiceOverlay;
