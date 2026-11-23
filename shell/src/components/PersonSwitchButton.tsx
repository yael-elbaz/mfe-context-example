import React, { lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import type { PersonType } from '../types/openService';

const SearchPersonMFE = lazy(() => import('mfe_search_employee/App'));

/** אלמנטים של רשימת ההשלמה (גם כשהיא ב-portal ב-body) — לחיצה עליהם לא סוגרת את החלונית */
const AUTOCOMPLETE_POPUP_SELECTOR =
  '[role="listbox"], [role="option"], [role="presentation"], .MuiAutocomplete-popper, .MuiPopper-root';

interface Props {
  /** בחירת אדם בחיפוש — ההחלפה עצמה (כולל אישור אם יש שירות פתוח) אצל הקורא */
  onPick: (idnt: string, personType: PersonType) => void;
  objectType?: PersonType[] | null;
  /** עיצוב הכפתור — שונה בהדר תיק העובד ובעמודת הלקוח */
  buttonClassName?: string;
  /** מיקום החלונית ביחס לכפתור (left-0 / right-0 וכו') */
  panelClassName?: string;
}

/** ה-input נוצר בתוך ה-MFE (lazy) — האפקט של אח באותו Suspense רץ רק אחרי שהוא נכנס ל-DOM */
const FocusFirstInput: React.FC<{ scope: React.RefObject<HTMLElement | null> }> = ({ scope }) => {
  useEffect(() => {
    scope.current?.querySelector('input')?.focus();
  }, [scope]);
  return null;
};

/**
 * כפתור "החלפה" + חלונית איתור אדם צמודה אליו (לא מודאלית — בלי רקע כהה, הדף נשאר גלוי).
 * בחירה מחליפה מיד; לחיצה מחוץ לחלונית או Esc סוגרות.
 */
const PersonSwitchButton: React.FC<Props> = ({
  onPick,
  objectType,
  buttonClassName = '',
  panelClassName = 'left-0',
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;
      if (rootRef.current?.contains(target)) return;
      // רשימת האוטוקומפליט של ה-MFE מרונדרת ב-portal מחוץ לחלונית — לחיצה עליה לא נחשבת "בחוץ"
      if (target.closest?.(AUTOCOMPLETE_POPUP_SELECTOR)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelected = (idnt: string, personType: PersonType) => {
    setOpen(false);
    onPick(idnt, personType);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={`flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-base text-navy ${
          open ? 'border-blue-outline bg-white' : 'border-navy/30'
        } ${buttonClassName}`}
      >
        <span aria-hidden className="text-lg leading-none">⇄</span>
        <span className="whitespace-nowrap">החלפה</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="החלפת אדם בתיק"
          dir="rtl"
          className={`absolute top-full z-30 mt-2 w-[400px] max-w-[90vw] rounded-[10px] border border-[#E2E8F0] bg-white p-3 shadow-[0_8px_24px_rgba(6,77,173,0.18)] ${panelClassName}`}
        >
          <span className="mb-1 block px-1 text-sm text-navy/70">איתור אדם</span>
          {/* employee-picker-mfe — רוחב מלא ל-MFE, מוגדר ב-index.css */}
          <div className="employee-picker-mfe">
            <Suspense
              fallback={
                <div className="flex h-16 items-center justify-center rounded-lg border border-blue-outline text-base text-gray-muted">
                  טוען חיפוש...
                </div>
              }
            >
              <SearchPersonMFE onSelected={handleSelected} objectType={objectType} placeholder="שם או מספר זהות" />
              <FocusFirstInput scope={panelRef} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonSwitchButton;
