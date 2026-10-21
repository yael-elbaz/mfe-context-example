import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { EmployeeProfile } from '../store/personStore';

const PIN_STORAGE_KEY = 'employeePortfolio.cardPinned';

const readPinned = () => {
  try { return localStorage.getItem(PIN_STORAGE_KEY) === '1'; } catch { return false; }
};
const writePinned = (pinned: boolean) => {
  try { localStorage.setItem(PIN_STORAGE_KEY, pinned ? '1' : '0'); } catch { /* storage חסום — ההעדפה לא תישמר */ }
};

const PinIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">
    <path
      d="M15 3l6 6-3 1-4 4 1 5-2 2-4-4-5 5-1-1 5-5-4-4 2-2 5 1 4-4 1-3z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const SummaryField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex min-w-0 flex-col">
    <span className="text-sm leading-tight text-navy/70">{label}</span>
    <span className="truncate text-base leading-tight text-navy">{value}</span>
  </div>
);

interface Props {
  employee: EmployeeProfile | null;
  onClose: () => void;
  /** מזהה השירות הפתוח — בכל בחירת שירות הכרטיס נסגר, גם אם היה נעוץ */
  openSherutId?: string | null;
  /** תוכן הכרטיס הנפתח — פרטי ההרחבה של העובד */
  children: React.ReactNode;
}

/**
 * ההדר הפנימי של תיק העובד.
 * מציג את פרטי הזיהוי העיקריים (תמונה, שם, מס׳ עובד, תפקיד, מחלקה).
 * ריחוף על ההדר מציף מתחתיו את כרטיס העובד ברוחב מלא; כפתור הנעיצה מקבע את הכרטיס
 * מתחת להדר (ההעדפה נשמרת בדפדפן). ההדר + הכרטיס הנעוץ נדבקים לראש המסך בגלילה.
 *
 * הכרטיס מרונדר תמיד (רק מוסתר) כדי שה-MFE לא ייטען מחדש בכל ריחוף.
 */
const EmployeePortfolioHeader: React.FC<Props> = ({ employee, onClose, openSherutId, children }) => {
  const [pinned, setPinned] = useState(readPinned);
  const [hovered, setHovered] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const open = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setHovered(true);
  }, []);
  // השהיה קצרה — כדי שמעבר עכבר מההדר לכרטיס לא יסגור אותו
  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setHovered(false), 150);
  }, []);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // בחירת שירות סוגרת את הכרטיס ומבטלת את הנעיצה — כדי לפנות מקום לשירות.
  // ההעדפה השמורה לא משתנה, כך שבכניסה הבאה לתיק הכרטיס יחזור נעוץ.
  useEffect(() => {
    if (!openSherutId) return;
    window.clearTimeout(closeTimer.current);
    setPinned(false);
    setHovered(false);
  }, [openSherutId]);

  const togglePinned = () => {
    setPinned((p) => {
      writePinned(!p);
      return !p;
    });
    setHovered(false);
  };

  const expanded = pinned || hovered;

  return (
    <div
      className="sticky top-[calc(var(--header-height)_+_16px)] z-20"
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onFocus={open}
      onBlur={scheduleClose}
    >
      <div className="flex items-center justify-between gap-4 border-b border-gray-2 bg-portfolio-header-bg px-6 py-3">
        {employee ? (
          <div className="flex min-w-0 items-center gap-4">
            <img
              src={employee.image}
              alt=""
              className="size-11 shrink-0 rounded-full border border-navy object-cover"
            />
            <div className="flex min-w-0 flex-col">
              <span className="text-sm leading-tight text-navy/70">תיק עובד</span>
              <span className="truncate text-lg font-medium leading-tight text-blue-heading">
                {employee.firstName} {employee.lastName}
              </span>
            </div>
            <span aria-hidden className="h-8 w-px shrink-0 bg-navy/20" />
            <div className="hidden min-w-0 items-center gap-6 sm:flex">
              <SummaryField label="מס׳ עובד" value={employee.id} />
              <SummaryField label="תפקיד" value={employee.role} />
              <SummaryField label="מחלקה" value={employee.department} />
            </div>
          </div>
        ) : (
          <span className="text-base text-navy/70">⏳ טוען תיק עובד...</span>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={togglePinned}
            aria-pressed={pinned}
            title={pinned ? 'ביטול נעיצת הכרטיס' : 'נעיצת הכרטיס מתחת להדר'}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-base ${
              pinned ? 'bg-white/70 text-blue-heading' : 'text-navy/70 hover:bg-white/40 hover:text-navy'
            }`}
          >
            <PinIcon filled={pinned} />
            <span className="hidden md:inline">{pinned ? 'נעוץ' : 'נעיצה'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-base text-navy/70 hover:bg-white/40 hover:text-navy"
          >
            <span className="whitespace-nowrap">סגירת תיק</span>
            <span aria-hidden className="text-lg leading-none">×</span>
          </button>
        </div>
      </div>

      {/* הכרטיס: נעוץ — חלק מהזרימה מתחת להדר. לא נעוץ — צף מעל התוכן בריחוף */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          pinned ? '' : 'absolute inset-x-0 top-full'
        }`}
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <div
            className={`border-b border-gray-2 bg-white px-6 py-4 ${
              pinned ? '' : 'shadow-[0_8px_16px_rgba(0,0,0,0.12)]'
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortfolioHeader;
