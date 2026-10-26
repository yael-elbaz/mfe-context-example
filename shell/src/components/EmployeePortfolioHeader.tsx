import React from 'react';
import type { EmployeeProfile } from '../store/personStore';

const SummaryField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex min-w-0 flex-col">
    <span className="text-sm leading-tight text-navy/70">{label}</span>
    <span className="truncate text-base leading-tight text-navy tabular-nums">{value}</span>
  </div>
);

interface Props {
  employee: EmployeeProfile | null;
  onClose: () => void;
  /** טאבי העובד והמידע של הטאב הפעיל — מוצגים תמיד מתחת להדר */
  children: React.ReactNode;
}

/**
 * ההדר הפנימי של תיק העובד.
 * שורה 1 — פרטי הזיהוי הקבועים (תמונה, שם, ת.ז., מס׳ עובד). הם לא שייכים לאף טאב ולא משתנים במעבר בין טאבים.
 * שורה 2 — טאבי העובד והמידע של הטאב הפעיל, גלויים תמיד (בלי ריחוף/לחיצה).
 * ההדר כולו נדבק לראש המסך בגלילה.
 */
const EmployeePortfolioHeader: React.FC<Props> = ({ employee, onClose, children }) => (
  <div className="sticky top-[calc(var(--header-height)_+_16px)] z-20">
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
          <div className="flex min-w-0 items-center gap-6">
            <SummaryField label="ת.ז." value={employee.tz} />
            <SummaryField label="מס׳ עובד" value={employee.employeeNumber} />
          </div>
        </div>
      ) : (
        <span className="text-base text-navy/70">⏳ טוען תיק עובד...</span>
      )}

      <button
        type="button"
        onClick={onClose}
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-base text-navy/70 hover:bg-white/40 hover:text-navy"
      >
        <span className="whitespace-nowrap">סגירת תיק</span>
        <span aria-hidden className="text-lg leading-none">×</span>
      </button>
    </div>

    <div className="border-b border-gray-2 bg-white px-6 pt-1 pb-3">
      {children}
    </div>
  </div>
);

export default EmployeePortfolioHeader;
