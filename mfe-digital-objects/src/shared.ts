export type ObjectType = 'ציוד' | 'רישיון תוכנה' | 'הרשאת מערכת';
export type ObjectStatus = 'פעיל' | 'בבדיקה' | 'מנוטרל';

/**
 * מה שה-Preview מעביר ל-Full דרך onShowAll(state) — ה-shell רק מעביר אותו הלאה כ-previewState.
 * נתון פשוט בלבד (נשמר ב-history של הדפדפן).
 */
export interface DigitalObjectsPreviewState {
  filtersOpen?: boolean;
}

export interface DigitalObject {
  id: string;
  name: string;
  type: ObjectType;
  status: ObjectStatus;
  assignedDate: string;
  details: string;
}

export const MOCK_OBJECTS: DigitalObject[] = [
  { id: 'do1', name: 'מחשב נייד Dell XPS 15', type: 'ציוד', status: 'פעיל', assignedDate: '03/2022', details: 'SN: DX2022-4521' },
  { id: 'do2', name: 'מכשיר נייד Samsung Galaxy', type: 'ציוד', status: 'פעיל', assignedDate: '01/2023', details: 'SN: SM-N981B' },
  { id: 'do3', name: 'Microsoft Office 365', type: 'רישיון תוכנה', status: 'פעיל', assignedDate: '09/2021', details: 'E3 License' },
  { id: 'do4', name: 'Zoom Business', type: 'רישיון תוכנה', status: 'פעיל', assignedDate: '09/2021', details: 'Pro Plan' },
  { id: 'do5', name: 'Adobe Creative Cloud', type: 'רישיון תוכנה', status: 'מנוטרל', assignedDate: '09/2021', details: 'CC All Apps' },
  { id: 'do6', name: 'גישת SAP HR', type: 'הרשאת מערכת', status: 'פעיל', assignedDate: '03/2022', details: 'מודול HR — קריאה/כתיבה' },
  { id: 'do7', name: 'גישת Confluence', type: 'הרשאת מערכת', status: 'פעיל', assignedDate: '06/2022', details: 'Editor' },
  { id: 'do8', name: 'גישת Jira', type: 'הרשאת מערכת', status: 'בבדיקה', assignedDate: '06/2022', details: 'Developer' },
  { id: 'do9', name: 'אוזניות Jabra Evolve2', type: 'ציוד', status: 'בבדיקה', assignedDate: '08/2023', details: 'SN: JB-2023-781' },
  { id: 'do10', name: 'גישת GitHub Enterprise', type: 'הרשאת מערכת', status: 'פעיל', assignedDate: '03/2022', details: 'Member' },
];

/**
 * "עריכה" ברשומה — שירות אוברליי (SHR009). ה-MFE רק מצהיר על השירות; ה-shell מחליט איך לפתוח,
 * ואם כבר פתוח אוברליי — חוסם ומהבהב על הקיים.
 * הצורה זהה ל-Service של ה-shell (כמו makeCall ב-mfe-sherutim).
 */
export const EDIT_SERVICE = {
  idntSheryut: 'SHR009',
  title: 'עריכת אובייקט דיגיטלי',
  url: 'http://localhost:3005/assets/remoteEntry.js',
  scope: 'mfe_sherut_exemplat',
  module: './App',
};

export function editServiceCall(obj: DigitalObject, employeeId: string) {
  const params: Record<string, string> = {
    type: 'sherut', id: employeeId, idntSheryut: EDIT_SERVICE.idntSheryut,
    title: `${EDIT_SERVICE.title} — ${obj.name}`,
    scope: EDIT_SERVICE.scope, module: EDIT_SERVICE.module,
    displaySettings: 'overlay', overlaySize: 'm',
    idntDigitalObject: obj.id,
  };
  return {
    codeSugObject: 0, textMenuItem: '', kamutknisot: 0, isFavorite: false,
    logiPnimi: false, openInIe: false, logiSugObjectMismach: false,
    categoryId: '', idntObject: 0, idntMenuItemAv: 0, idntMenuItem: 0,
    textNativ: '', textMenu: '', textMenuTarget: '', idntMaarechet: 0,
    url: EDIT_SERVICE.url,
    menuParamsList: Object.entries(params).map(([parameterKey, parameterValue]) => ({ codeSugParameter: '', parameterKey, parameterValue })),
  };
}

/** מה שה-shell מעביר כ-openService — הצורה המלאה מוגדרת ב-shell */
export type OpenService = (meta: ReturnType<typeof editServiceCall>) => void;

export const STATUS_STYLE: Record<ObjectStatus, { bg: string; color: string }> = {
  'פעיל':    { bg: '#e6f4ea', color: '#2d7a3a' },
  'בבדיקה':  { bg: '#fff8e1', color: '#b07a00' },
  'מנוטרל':  { bg: '#fce8e8', color: '#c00' },
};
