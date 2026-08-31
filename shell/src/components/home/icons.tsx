import React from 'react';

/* אייקונים מיוצאים מ-Figma (Design System) — נתוני ה-vector מקוריים.
   כל אייקון עטוף בריבוע בגודל שהוגדר בעיצוב, והגרפיקה ממורכזת בתוכו. */

/* outline/diagonal-arrow-left-up — 12×12 בתוך ריבוע 24 */
export const DiagonalArrowIcon: React.FC = () => (
  <span className="inline-flex size-6 shrink-0 items-center justify-center overflow-hidden">
    <svg width="12" height="12" viewBox="0 0 12.0003 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.7071 10.293L3.41805 2.004L9.00105 2C9.55305 2 10.0001 1.551 10.0001 0.999C10.0001 0.447 9.55205 0 9.00005 0H8.99905L1.04905 0.00600004C0.499053 0.00700004 0.0540533 0.451 0.0500533 1L2.64009e-05 8.994C-0.00394684 9.546 0.441053 9.997 0.994053 10H1.00005C1.55005 10 1.99605 9.556 2.00005 9.006L2.03505 3.449L10.2931 11.707C10.4881 11.902 10.7441 12 11.0001 12C11.2561 12 11.5121 11.902 11.7071 11.707C12.0981 11.316 12.0981 10.684 11.7071 10.293Z" fill="#00033D" />
    </svg>
  </span>
);

/* אותו אייקון בווריאנט Tile — ריבוע 40 עם רקע #F1F5FB (Figma 17:11657) */
export const DiagonalArrowTile: React.FC = () => (
  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F1F5FB] p-2">
    <DiagonalArrowIcon />
  </span>
);

/* Group 795 — אייקון יחידה/מבנה (14×14) */
export const UnitIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M1.74976 12.2498H12.2498" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.33325 12.2499V3.49992C2.33325 3.1905 2.45617 2.89375 2.67496 2.67496C2.89375 2.45617 3.1905 2.33325 3.49992 2.33325H10.4999C10.8093 2.33325 11.1061 2.45617 11.3249 2.67496C11.5437 2.89375 11.6666 3.1905 11.6666 3.49992V12.2499" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.25 12.2502V7.5835C5.25 7.11937 5.43437 6.67425 5.76256 6.34606C6.09075 6.01787 6.53587 5.8335 7 5.8335C7.46413 5.8335 7.90925 6.01787 8.23744 6.34606C8.56563 6.67425 8.75 7.11937 8.75 7.5835V12.2502" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Group 792 — אייקון תאריך (14×14) */
export const CalendarIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M2.33333 4.08333C2.33333 3.77391 2.45625 3.47717 2.67504 3.25838C2.89383 3.03958 3.19058 2.91667 3.5 2.91667H10.5C10.8094 2.91667 11.1062 3.03958 11.325 3.25838C11.5437 3.47717 11.6667 3.77391 11.6667 4.08333V11.0833C11.6667 11.3928 11.5437 11.6895 11.325 11.9083C11.1062 12.1271 10.8094 12.25 10.5 12.25H3.5C3.19058 12.25 2.89383 12.1271 2.67504 11.9083C2.45625 11.6895 2.33333 11.3928 2.33333 11.0833V4.08333Z" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.33333 1.75V4.08333" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.66667 1.75V4.08333" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.33333 6.41667H11.6667" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.08333 8.16667H4.09092" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.83922 8.16667H5.84255" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.58922 8.16667H7.59255" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.34207 8.16667H9.3454" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.59207 9.91667H7.5954" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.08922 9.91667H4.09255" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.83922 9.91667H5.84255" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Reporting component/Icons/clokc 1 — אייקון שעה (14×14) */
export const ClockIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M2.14963 9.00909C1.8858 8.37213 1.75 7.68944 1.75 7C1.75 6.31056 1.8858 5.62787 2.14963 4.99091C2.41347 4.35395 2.80018 3.7752 3.28769 3.28769C3.7752 2.80018 4.35395 2.41347 4.99091 2.14963C5.62787 1.8858 6.31056 1.75 7 1.75C7.68944 1.75 8.37213 1.8858 9.00909 2.14963C9.64605 2.41347 10.2248 2.80018 10.7123 3.28769C11.1998 3.7752 11.5865 4.35395 11.8504 4.99091C12.1142 5.62787 12.25 6.31056 12.25 7C12.25 7.68944 12.1142 8.37213 11.8504 9.00909C11.5865 9.64605 11.1998 10.2248 10.7123 10.7123C10.2248 11.1998 9.64605 11.5865 9.00909 11.8504C8.37213 12.1142 7.68944 12.25 7 12.25C6.31056 12.25 5.62787 12.1142 4.99091 11.8504C4.35395 11.5865 3.7752 11.1998 3.28769 10.7123C2.80018 10.2248 2.41347 9.64605 2.14963 9.00909Z" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 7H9.04167" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 4.08333V7" stroke="#A0AEC0" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
