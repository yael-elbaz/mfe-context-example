import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { OverlaySize } from '../../types/openService';
import { useDraggable } from './useDraggable';
import { useOverlayStore } from '../../store/overlayStore';
import { useIsMobile } from './useIsMobile';
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

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';


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
 * גודל הבסיס (s/m/l) מגיע מהגדרות השירות או מתוך השירות (onResize).
 * כשגודל הבסיס s או m — כפתור בשורת הכותרת מגדיל את החלון ל-L ומחזיר לגודל הבסיס.
 * כפתור מזעור משאיר רק את פס הכותרת בתחתית המסך; לחיצה עליו (או על הפס) מחזירה את החלון.
 * מובייל (< 768px): מסך מלא שעולה מלמטה, בלי גרירה והגדלה, הדף מאחור נעול; ממוזער = פס ברוחב המסך.
 *   כפתור "חזור" של הטלפון סוגר — לשירות יש route משלו בהיסטוריה.
 * ניסיון לפתוח אוברליי שני (nudgeCount ב-overlayStore) — החלון מהבהב ומוצגת הודעה.
 */
const ServiceOverlay: React.FC<ServiceOverlayProps> = ({ title, initialSize, Component, error, serviceProps, onClose }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<OverlaySize>(initialSize);
  const [expanded, setExpanded] = useState(false);
  // ממוזער — רק פס הכותרת נשאר, צמוד לתחתית המסך (כמו טיוטה ב-Gmail). השירות נשאר טעון.
  const [minimized, setMinimized] = useState(false);
  // השירות קובע גודל בסיס (s/m/l) — זה גם מבטל הגדלה
  const resizeFromService = (s: OverlaySize) => {
    setSize(s);
    setExpanded(false);
  };
  // הגדלה מתוך מצב ממוזער — פותחת את החלון ישר בגודל L
  const toggleExpanded = () => {
    if (minimized) {
      setMinimized(false);
      setExpanded(true);
    } else {
      setExpanded((v) => !v);
    }
  };
  const { style: dragStyle, handleProps, clampIntoView } = useDraggable(windowRef);
  // מובייל: מסך מלא, בלי גרירה ובלי הגדלה. החלון מכסה את הדף — ולכן מתנהג כמודאלי.
  const isMobile = useIsMobile();
  const coversPage = isMobile && !minimized;
  const nudgeCount = useOverlayStore((s) => s.nudgeCount);
  const [notice, setNotice] = useState(false);
  // הערך בזמן הפתיחה — מהבהבים רק על ניסיונות שקרו אחריה
  const nudgeAtOpen = useRef(nudgeCount);

  // שינוי גודל שומר על הפינה השמאלית התחתונה; אם החלון יצא מהמסך — מחזירים אותו פנימה
  // (בזמן מזעור לא — שם ה-translate מבוטל והמדידה הייתה מקלקלת את המיקום השמור)
  useLayoutEffect(() => {
    if (minimized || isMobile) return;
    clampIntoView(titleBarRef.current?.offsetHeight ?? 0);
  }, [size, expanded, minimized, isMobile, clampIntoView]);

  // מובייל — הדף שמאחור לא נגלל כשהחלון מכסה אותו
  useEffect(() => {
    if (!coversPage) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [coversPage]);

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
  // במובייל (החלון מכסה את הדף) — Tab מסתובב בתוך החלון ולא יוצא לדף המוסתר
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key !== 'Tab' || !coversPage || !windowRef.current) return;
    const items = Array.from(windowRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === windowRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const windowClass = isMobile
    ? minimized
      ? 'inset-x-0 bottom-0 w-full rounded-t-xl border-x-0 border-b-0'
      : 'inset-0 h-dvh w-full border-0 motion-safe:animate-[overlay-slide-up_0.25s_ease-out]'
    : minimized
      ? 'bottom-0 left-6 w-[280px] max-w-[calc(100vw_-_48px)] rounded-t-xl border-b-0'
      : `bottom-6 left-6 translate-x-[var(--drag-x)] translate-y-[var(--drag-y)] max-h-[calc(100vh_-_48px)] max-w-[calc(100vw_-_48px)] rounded-xl ${SIZE_CLASS[expanded ? 'l' : size]}`;

  // כפתורי הכותרת — 44px במובייל (יעד מגע), 32px בדסקטופ
  const iconBtn = `flex ${isMobile ? 'size-11' : 'size-8'} cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-[#00033D] hover:bg-[#D5DBEA]`;

  // אזורים בטוחים (notch / פס הבית) — רק במובייל
  const titleBarSafeArea = !isMobile ? '' : minimized ? 'pb-[max(12px,env(safe-area-inset-bottom))]' : 'pt-[max(12px,env(safe-area-inset-top))]';

  return (
    <>
      <div
        ref={windowRef}
        role="dialog"
        aria-modal={coversPage || undefined}
        aria-labelledby="service-overlay-title"
        tabIndex={-1}
        dir="rtl"
        style={dragStyle}
        onKeyDown={onKeyDown}
        className={`fixed z-[501] flex flex-col overflow-hidden border border-[#E2E8F0] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] outline-none ${windowClass}`}
      >
        {/* הבהוב — מסגרת כחולה מעל החלון; key מתחיל את האנימציה מחדש בכל ניסיון */}
        {notice && (
          <div
            key={nudgeCount}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0 shadow-[inset_0_0_0_3px_#4395FF] animate-[overlay-flash_0.4s_ease-in-out_2]"
          />
        )}

        {/* שורת כותרת — ידית הגרירה; במצב ממוזער לחיצה עליה מחזירה את החלון */}
        <div
          ref={titleBarRef}
          {...(minimized || isMobile ? {} : handleProps)}
          onClick={(e) => {
            if (minimized && !(e.target as HTMLElement).closest('button')) setMinimized(false);
          }}
          className={`flex shrink-0 touch-none items-center justify-between gap-3 bg-[#E8ECF4] px-4 py-3 select-none ${
            minimized ? 'cursor-pointer' : `border-b border-[#C5CBDD] ${isMobile ? '' : 'cursor-move'}`
          } ${titleBarSafeArea}`}
        >
          <h2 id="service-overlay-title" className={`m-0 truncate text-base font-medium ${HEADING_COLOR}`}>
            {title || 'שירות'}
          </h2>
          <div className="flex shrink-0 items-center gap-1">
            {/* מזעור / החזרה */}
            <button
              type="button"
              onClick={() => setMinimized((v) => !v)}
              aria-pressed={minimized}
              aria-label={minimized ? 'החזרת החלון' : 'מזעור'}
              title={minimized ? 'החזרת החלון' : 'מזעור'}
              className={iconBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 18h12" />
              </svg>
            </button>
            {/* הגדלה ל-L — רק כשגודל הבסיס s או m, ולא במובייל (שם החלון כבר מסך מלא) */}
            {size !== 'l' && !isMobile && <button
              type="button"
              onClick={toggleExpanded}
              aria-pressed={expanded && !minimized}
              aria-label={expanded && !minimized ? 'חזרה לגודל רגיל' : 'הגדלה'}
              title={expanded && !minimized ? 'חזרה לגודל רגיל' : 'הגדלה'}
              className={iconBtn}
            >
              {expanded && !minimized ? (
                // הקטנה — חיצים פנימה
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                </svg>
              ) : (
                // הגדלה — חיצים החוצה
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              )}
            </button>}
            <button
              type="button"
              onClick={onClose}
              aria-label="סגירה"
              className={`${iconBtn} text-xl leading-none`}
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

        {/* גוף — השירות ממלא את הגובה וגולל בפנים; במזעור רק מוסתר כדי לא לאבד את מצב השירות */}
        <div className={`min-h-0 flex-1 overflow-y-auto p-4 ${minimized ? 'hidden' : ''} ${isMobile ? 'pb-[max(16px,env(safe-area-inset-bottom))]' : ''}`}>
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
                onResize={resizeFromService}
              />
            </OverlayErrorBoundary>
          )}
        </div>
      </div>
    </>
  );
};

export default ServiceOverlay;
