export type ObjectType = 'ציוד' | 'רישיון תוכנה' | 'הרשאת מערכת';
export type ObjectStatus = 'פעיל' | 'בבדיקה' | 'מנוטרל';

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

export const STATUS_STYLE: Record<ObjectStatus, { bg: string; color: string }> = {
  'פעיל':    { bg: '#e6f4ea', color: '#2d7a3a' },
  'בבדיקה':  { bg: '#fff8e1', color: '#b07a00' },
  'מנוטרל':  { bg: '#fce8e8', color: '#c00' },
};
