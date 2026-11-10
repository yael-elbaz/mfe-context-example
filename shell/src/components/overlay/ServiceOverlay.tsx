import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { OverlaySize } from '../../types/openService';
import { useDraggable } from './useDraggable';
import { useOverlayStore } from '../../store/overlayStore';
import './overlay.css';

// קלאסים בתחביר שעובד גם ב-Tailwind 3.4 וגם ב-v4 (ערכים שרירותיים, בלי טוקנים מ-@theme),
// כדי שאפשר יהיה להעתיק את התיקייה לפרויקט אחר בלי לגעת ב-tailwind.config.
const HEADING_COLOR = 'text-[#1E3BA2]';

const NOTICE_MS = 2000;

// מידות זמניות עד שיגיע עיצוב ב-Figma. תמיד מוגבל לגודל המסך פחות 24px מכל צד.
const SIZE_CLASS: Record<OverlaySize, string> = {
  s: 'w-[400px] h-[480px]',
  m: 'w-[640px] h-[600px]',
  l: 'w-[960px] h-[800px]',
};

const SIZES: OverlaySize[] = ['s', 'm', 'l'];

export interface ServiceOverlayProps {
  title: string;
  /** גודל הפתיחה מהגדרות השירות */
  initialSize: OverlaySize;
  /** ה-MFE של השירות — null בזמן טעינה */
  Component: React.ComponentType<any> | null;
  error: string | null;
  /** props שעוברים ל-MFE של השירות (מעבר ל-displayMode / onClose / onResize) */
  serviceProps: Record<string, unknown>;
  onClose: () => void;
}

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
 * חלון השירות באוברליי: נפתח בפינה השמאלית התחתונה. לא מודאלי — הדף שמאחור נשאר פעיל.
 * מרונדר מתוך SherutDynamicView — חי כל עוד ה-route של השירות פתוח.
 * הגודל משתנה מהמתג בשורת הכותרת, או מתוך השירות (onResize).
 * ניסיון לפתוח אוברליי שני (nudgeCount ב-overlayStore) — החלון מהבהב ומוצגת הודעה.
 */
const ServiceOverlay: React.FC<ServiceOverlayProps> = ({ title, initialSize, Component, error, serviceProps, onClose }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<OverlaySize>(initialSize);
  const { style: dragStyle, handleProps, clampIntoView } = useDraggable(windowRef);
  const nudgeCount = useOverlayStore((s) => s.nudgeCount);
  const [notice, setNotice] = useState(false);
  // הערך בזמן הפתיחה — מהבהבים רק על ניסיונות שקרו אחריה
  const nudgeAtOpen = useRef(nudgeCount);

  // שינוי גודל שומר על הפינה השמאלית התחתונה; אם החלון יצא מהמסך — מחזירים אותו פנימה
  useLayoutEffect(() => {
    clampIntoView(titleBarRef.current?.offsetHeight ?? 0);
  }, [size, clampIntoView]);

  useEffect(() => {
    if (nudgeCount === nudgeAtOpen.current) return;
    setNotice(true);
    const t = window.setTimeout(() => setNotice(false), NOTICE_MS);
    return () => window.clearTimeout(t);
  }, [nudgeCount]);

  // פוקוס נכנס לחלון בפתיחה וחוזר לאלמנט הקודם בסגירה
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    windowRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  // Esc סוגר רק כשהפוקוס בתוך החלון — אחרת הוא שייך לדף שמאחור
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <>
      <div
        ref={windowRef}
        role="dialog"
        aria-labelledby="service-overlay-title"
        tabIndex={-1}
        dir="rtl"
        style={dragStyle}
        onKeyDown={onKeyDown}
        className={`fixed bottom-6 left-6 z-[501] flex translate-x-[var(--drag-x)] translate-y-[var(--drag-y)] max-h-[calc(100vh_-_48px)] max-w-[calc(100vw_-_48px)] flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] outline-none ${SIZE_CLASS[size]}`}
      >
        {/* הבהוב — מסגרת כחולה מעל החלון; key מתחיל את האנימציה מחדש בכל ניסיון */}
        {notice && (
          <div
            key={nudgeCount}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0 shadow-[inset_0_0_0_3px_#4395FF] animate-[overlay-flash_0.4s_ease-in-out_2]"
          />
        )}

        {/* שורת כותרת — ידית הגרירה */}
        <div
          ref={titleBarRef}
          {...handleProps}
          className="flex shrink-0 cursor-move touch-none items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3 select-none"
        >
          <h2 id="service-overlay-title" className={`m-0 truncate text-base font-medium ${HEADING_COLOR}`}>
            {title || 'שירות'}
          </h2>
          <div className="flex shrink-0 items-center gap-1">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                aria-label={`גודל ${s.toUpperCase()}`}
                className={`flex size-7 cursor-pointer items-center justify-center rounded-md border-none text-xs font-medium ${
                  size === s ? 'bg-[#4395FF] text-white' : 'bg-transparent text-[#00033D] hover:bg-[#F8F9FD]'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
            <button
              type="button"
              onClick={onClose}
              aria-label="סגירה"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-xl leading-none text-[#00033D] hover:bg-[#F8F9FD]"
            >
              ×
            </button>
          </div>
        </div>

        {/* ניסיון לפתוח אוברליי שני */}
        {notice && (
          <div role="alert" className="shrink-0 bg-[#FFF8E1] px-4 py-2 text-sm text-[#7A5500]">
            יש כבר שירות פתוח, יש לסגור אותו קודם
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
            <div className={`p-12 text-center ${HEADING_COLOR}`}>⏳ טוען שירות...</div>
          ) : (
            <OverlayErrorBoundary>
              <Component
                {...serviceProps}
                displayMode="overlay"
                onClose={onClose}
                onResize={setSize}
              />
            </OverlayErrorBoundary>
          )}
        </div>
      </div>
    </>
  );
};

export default ServiceOverlay;
