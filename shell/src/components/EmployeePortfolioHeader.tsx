import React from 'react';
import type { AnyPerson } from '../store/personStore';
import type { PersonType } from '../types/openService';
import { SWITCHABLE } from '../hooks/usePersonSwitch';
import PersonSwitchButton from './PersonSwitchButton';

/**
 * החלקים של ה-shell בכרטיס תיק העובד. ה-MFE (variant="details") פורס אותם בשורה 1 של הכרטיס
 * סביב הטאבים — ה-shell נשאר הבעלים של הזהות ושל ההחלפה (ההתנהגות, ה-store, ה-ConfirmDialog).
 */

const UserIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden fill="none" stroke="#A0AEC0" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const ArrowRightIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const IdField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex shrink-0 flex-col">
    <span className="text-xs leading-tight text-[#4A5568]">{label}</span>
    <span className="text-sm font-medium leading-tight text-[#00033D] tabular-nums">{value}</span>
  </div>
);

const Bar: React.FC<{ className: string }> = ({ className }) => (
  <span aria-hidden className={`block animate-pulse rounded bg-[#E2E8F0] ${className}`} />
);

/** מה מציגים בזהות לכל סוג אדם — הטקסטים נגזרים מ-person.type */
function identityView(person: AnyPerson) {
  if (person.type === 'customer') {
    return { title: 'תיק לקוח', image: '', fields: [{ label: 'מס׳ לקוח', value: person.id }] };
  }
  return {
    title: 'תיק עובד',
    image: person.image,
    fields: [
      { label: 'מס׳ עובד', value: person.employeeNumber },
      { label: 'ת.ז.', value: person.tz },
    ],
  };
}

/** תמונה, "תיק עובד/לקוח", שם, מס׳ עובד/לקוח (+ ת.ז. לעובד) — הקצה הימני של שורה 1. בלי אדם (טעינה) — סקלטון */
export const PortfolioIdentity: React.FC<{ person: AnyPerson | null }> = ({ person }) => {
  if (!person) {
    return (
      <div className="flex shrink-0 items-center gap-5" aria-busy="true" aria-label="טוען תיק">
        <div className="flex items-center gap-3">
          <Bar className="size-[52px] rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Bar className="h-2.5 w-12" />
            <Bar className="h-4 w-28" />
          </div>
        </div>
        {['w-12', 'w-20'].map(w => (
          <div key={w} className="flex flex-col gap-1.5">
            <Bar className="h-2.5 w-12" />
            <Bar className={`h-3.5 ${w}`} />
          </div>
        ))}
      </div>
    );
  }

  const { title, image, fields } = identityView(person);

  return (
    <div className="flex shrink-0 items-center gap-5">
      <div className="flex items-center gap-3">
        <div className="grid size-[52px] shrink-0 place-items-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          {image ? <img src={image} alt="" className="size-full object-cover" /> : <UserIcon />}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs leading-tight text-[#4A5568]">{title}</span>
          <span className="truncate text-lg font-semibold leading-tight text-[#00033D]">
            {person.firstName} {person.lastName}
          </span>
        </div>
      </div>
      {fields.map(f => (
        <IdField key={f.label} label={f.label} value={f.value} />
      ))}
    </div>
  );
};

/** כפתור "החלפת עובד" — הקצה השמאלי של שורה 1 */
export const PortfolioSwitchButton: React.FC<{ onSwitch: (idnt: string, personType: PersonType) => void }> = ({ onSwitch }) => (
  <PersonSwitchButton onPick={onSwitch} objectType={SWITCHABLE} label="החלפת עובד" />
);

/** סגירת התיק — כפתור חץ בשורה נפרדת מעל הכרטיס, צמוד לימין */
export const PortfolioCloseButton: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <button
    type="button"
    onClick={onClose}
    aria-label="סגירת תיק"
    title="סגירת תיק"
    className="grid size-9 cursor-pointer place-items-center rounded-md border border-[#006AFF] bg-white p-1.5 text-[#006AFF] hover:bg-[#F0F6FF]"
  >
    <ArrowRightIcon />
  </button>
);

/**
 * כשה-MFE לא מוצג (טעינת העובד / עובד לא נמצא) — ה-shell מצייר את הכרטיס בעצמו,
 * כדי שאפשר יהיה להחליף עובד גם אז.
 *  loading — סקלטון (זהות, טאבים, שדות).
 *  notFound — "עובד לא נמצא" + החלפת עובד, בשורה אחת.
 */
export const PortfolioHeaderFallback: React.FC<{
  state: 'loading' | 'notFound';
  onSwitch: (idnt: string, personType: PersonType) => void;
}> = ({ state, onSwitch }) => {
  if (state === 'notFound') {
    return (
      <div className="flex h-[76px] items-center justify-between gap-5 rounded-xl bg-[#F7FAFC] px-5">
        <span className="text-base text-[#00033D]">עובד לא נמצא</span>
        <PortfolioSwitchButton onSwitch={onSwitch} />
      </div>
    );
  }

  return (
    <div className="flex flex-col" aria-busy="true">
      <div className="flex h-[76px] items-center gap-5 rounded-t-xl border-b border-[#E2E8F0] bg-[#F7FAFC] px-5">
        <PortfolioIdentity person={null} />
        <div className="flex min-w-0 flex-1 items-center gap-6 overflow-hidden" aria-hidden>
          {['w-20', 'w-16', 'w-24', 'w-16', 'w-20'].map((w, i) => (
            <div key={i} className="flex shrink-0 items-center gap-1.5">
              <Bar className="size-[18px] rounded-full" />
              <Bar className={`h-3.5 ${w}`} />
            </div>
          ))}
        </div>
        <PortfolioSwitchButton onSwitch={onSwitch} />
      </div>
      <div className="flex min-h-9 items-center gap-9 overflow-hidden px-5 py-3" aria-hidden>
        {['w-16', 'w-24', 'w-20', 'w-28', 'w-16', 'w-20'].map((w, i) => (
          <div key={i} className="flex shrink-0 flex-col gap-1.5">
            <Bar className="h-2.5 w-12" />
            <Bar className={`h-3.5 ${w}`} />
          </div>
        ))}
      </div>
    </div>
  );
};
