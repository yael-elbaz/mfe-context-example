import type { Sherut, SherutCategory } from './types';

const EXEMPLAT_MFE = {
  mfeUrl:    'http://localhost:3005/assets/remoteEntry.js',
  mfeScope:  'mfe_sherut_exemplat',
  mfeModule: './App',
};

// בפרודקשן ה-iconUrl יגיע מהשרת כ-URL לקובץ אייקון.
// כאן אנחנו משתמשים ב-data-URI כדי שהאייקונים יוצגו גם ללא רשת.
const icon = (paths: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2300033D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>${paths}</svg>`;

const ICON_CALENDAR  = icon("<rect x='3' y='4.5' width='14' height='13' rx='2'/><path d='M3 8h14M7 2.5v4M13 2.5v4'/>");
const ICON_WALLET    = icon("<path d='M3 6.5A2 2 0 0 1 5 4.5h10.5a1.5 1.5 0 0 1 1.5 1.5V15a1.5 1.5 0 0 1-1.5 1.5H5A2 2 0 0 1 3 14.5z'/><path d='M17 8.5h-3.5a1.75 1.75 0 0 0 0 3.5H17'/>");
const ICON_USER      = icon("<circle cx='10' cy='6.5' r='3'/><path d='M4 16.5a6 6 0 0 1 12 0'/>");
const ICON_BUILDING  = icon("<rect x='4' y='3' width='12' height='14' rx='1'/><path d='M8 17v-3h4v3M7 6h2M11 6h2M7 9.5h2M11 9.5h2'/>");
const ICON_CHART     = icon("<path d='M3 3v14h14'/><path d='M7 14v-4M11 14V7M15 14v-6'/>");
const ICON_MAIL      = icon("<rect x='3' y='5' width='14' height='10' rx='1.5'/><path d='M3.5 6l6.5 5 6.5-5'/>");
const ICON_PHONE     = icon("<path d='M5 3.5h3l1.2 3-1.6 1.2a9 9 0 0 0 4.7 4.7l1.2-1.6 3 1.2v3a1.5 1.5 0 0 1-1.6 1.5A13.5 13.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5z'/>");
const ICON_BRIEFCASE = icon("<rect x='3' y='6.5' width='14' height='9' rx='1.5'/><path d='M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5M3 10h14'/>");
const ICON_HEART     = icon("<path d='M10 16s-5.5-3.6-5.5-7.3A3.2 3.2 0 0 1 10 6.2a3.2 3.2 0 0 1 5.5 2.5C15.5 12.4 10 16 10 16z'/>");

export const SHERUTIM_CATEGORIES: SherutCategory[] = [
  { type: 'self', id: 'cat1', idntObject: 1, title: 'חופשות ונוכחות',   iconUrl: ICON_CALENDAR },
  { type: 'self', id: 'cat2', idntObject: 2, title: 'כספים ושכר',       iconUrl: ICON_WALLET },
  { type: 'self', id: 'cat3', idntObject: 3, title: 'פרטים אישיים',     iconUrl: ICON_USER },
  { type: 'self', id: 'cat4', idntObject: 4, title: 'מבנים ולוגיסטיקה', iconUrl: ICON_BUILDING },
  { type: 'self', id: 'cat5', idntObject: 5, title: 'דוחות וניתוח',     iconUrl: ICON_CHART },
  { type: 'self', id: 'cat6', idntObject: 6, title: 'פניות ודואר',      iconUrl: ICON_MAIL },
  { type: 'self', id: 'cat7', idntObject: 7, title: 'תקשורת',           iconUrl: ICON_PHONE },
  { type: 'self', id: 'cat8', idntObject: 8, title: 'גיוס וקריירה',     iconUrl: ICON_BRIEFCASE },
  { type: 'self', id: 'cat9', idntObject: 9, title: 'רווחה ובריאות',    iconUrl: ICON_HEART },
];

export const MOCK_SHERUTIM: Sherut[] = [
  { type: 'new', id: 's1', idntSheryut: 'SHR001', title: 'בקשת חופשה',           status: 'פתוח',  idntObjectAv: 1, ...EXEMPLAT_MFE },
  { type: 'new', id: 's2', idntSheryut: 'SHR002', title: 'אישור נסיעות',          status: 'ממתין', idntObjectAv: 1, ...EXEMPLAT_MFE },
  { type: 'new', id: 's3', idntSheryut: 'SHR003', title: 'עדכון פרטים אישיים',    status: 'הושלם', idntObjectAv: 3, ...EXEMPLAT_MFE },
  { type: 'new', id: 's4', idntSheryut: 'SHR004', title: 'בקשת ציוד משרדי',       status: 'פתוח',  idntObjectAv: 2, ...EXEMPLAT_MFE },
  { type: 'new', id: 's5', idntSheryut: 'SHR005', title: 'דיווח שעות עבודה',      status: 'ממתין', idntObjectAv: 1, ...EXEMPLAT_MFE },
  { type: 'new', id: 's6', idntSheryut: 'SHR006', title: 'בקשת הלוואה',           status: 'פתוח',  idntObjectAv: 2, ...EXEMPLAT_MFE },
  { type: 'new', id: 's7', idntSheryut: 'SHR007', title: 'עדכון כתובת מגורים',    status: 'הושלם', idntObjectAv: 3, ...EXEMPLAT_MFE },
  { type: 'new', id: 's8', idntSheryut: 'SHR008', title: 'תלוש שכר',             status: 'הושלם', idntObjectAv: 2, ...EXEMPLAT_MFE },
  { type: 'new', id: 's9',  idntSheryut: 'SHR009', title: 'הזמנת חדר ישיבות',     status: 'פתוח',  idntObjectAv: 4, ...EXEMPLAT_MFE },
  { type: 'new', id: 's10', idntSheryut: 'SHR010', title: 'בקשת ריהוט',          status: 'ממתין', idntObjectAv: 4, ...EXEMPLAT_MFE },
  { type: 'new', id: 's11', idntSheryut: 'SHR011', title: 'דוח נוכחות חודשי',     status: 'הושלם', idntObjectAv: 5, ...EXEMPLAT_MFE },
  { type: 'new', id: 's12', idntSheryut: 'SHR012', title: 'ניתוח ביצועים',        status: 'פתוח',  idntObjectAv: 5, ...EXEMPLAT_MFE },
  { type: 'new', id: 's13', idntSheryut: 'SHR013', title: 'פתיחת פנייה',          status: 'פתוח',  idntObjectAv: 6, ...EXEMPLAT_MFE },
  { type: 'new', id: 's14', idntSheryut: 'SHR014', title: 'מעקב דואר נכנס',       status: 'ממתין', idntObjectAv: 6, ...EXEMPLAT_MFE },
  { type: 'new', id: 's15', idntSheryut: 'SHR015', title: 'בקשת קו טלפון',        status: 'פתוח',  idntObjectAv: 7, ...EXEMPLAT_MFE },
  { type: 'new', id: 's16', idntSheryut: 'SHR016', title: 'משרה פנימית',          status: 'פתוח',  idntObjectAv: 8, ...EXEMPLAT_MFE },
  { type: 'new', id: 's17', idntSheryut: 'SHR017', title: 'בקשת קידום',           status: 'ממתין', idntObjectAv: 8, ...EXEMPLAT_MFE },
  { type: 'new', id: 's18', idntSheryut: 'SHR018', title: 'תיאום בדיקה רפואית',    status: 'הושלם', idntObjectAv: 9, ...EXEMPLAT_MFE },
  { type: 'new', id: 's19', idntSheryut: 'SHR019', title: 'בקשת ייעוץ רווחה',      status: 'פתוח',  idntObjectAv: 9, ...EXEMPLAT_MFE },
];
