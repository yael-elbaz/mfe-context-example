import type { RawTabConfig, TabConfig, TabData } from './types';

export const SYNTHETIC_MORE_DATA_TAB_ID = -1;

// Fixed config for the "more data" tab. Only its dataUrl varies (provided per-sherut
// via mfeConfig.extendedTabDataUrl); label, color and order are always these constants and
// the tab is always rendered as the active one when present.
export const MORE_DATA_TAB = {
  label: 'מידע נוסף',
  color: '#7B2FBE',
  order: Infinity, // always rendered last in the bar
  iconUrl: 'https://api.iconify.design/mdi/dots-horizontal-circle-outline.svg',
} as const;

export function buildMoreDataTab(dataUrl: string): TabConfig {
  return {
    id: SYNTHETIC_MORE_DATA_TAB_ID,
    objectName: 'moreData',
    displayName: MORE_DATA_TAB.label,
    title: MORE_DATA_TAB.label,
    color: MORE_DATA_TAB.color,
    order: MORE_DATA_TAB.order,
    dataUrl,
    iconUrl: MORE_DATA_TAB.iconUrl,
    isInternal: false,
  };
}

const TABS_CONFIG_URL: string = (import.meta.env as Record<string, string>).VITE_TABS_CONFIG_URL ?? '';

const MOCK_TABS: RawTabConfig[] = [
  {
    CODE_SUG_OBJECT: 1, ICON_URL: 'https://api.iconify.design/mdi/account-outline.svg', IDNT_MENU_ITEM: 101, IDNT_MENU_ITEM_AV: '',
    IDNT_OBJECT: '1', LOGI_HTTPS: true, LOGI_PARTIAL_ICON_URL: false, LOGI_PARTIAL_URL: false,
    LOGI_PNIMI: true, LOGI_SUG_OBJECT_MISMACH: false, OPEN_IN_IE: false, ORDER_BY: '1',
    TEXT_MENU: '', TEXT_MENU_ITEM: 'נתונים בסיסיים', TEXT_MENU_TARGET: '', TEXT_NATIV: '',
    TEXT_OBJECT_NAME: 'BasicData',
    Menu_Params_list: [
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'COLOR', PARAMETER_VALUE: '#00A870' },
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'Getdata', PARAMETER_VALUE: 'https://api-emp.example.il/GetDetails?' },
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'ORDER', PARAMETER_VALUE: '1' },
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'TITLE', PARAMETER_VALUE: 'נתונים בסיסיים' },
    ],
  },
  {
    CODE_SUG_OBJECT: 1, ICON_URL: 'https://api.iconify.design/mdi/cash.svg', IDNT_MENU_ITEM: 102, IDNT_MENU_ITEM_AV: '',
    IDNT_OBJECT: '1', LOGI_HTTPS: true, LOGI_PARTIAL_ICON_URL: false, LOGI_PARTIAL_URL: false,
    LOGI_PNIMI: false, LOGI_SUG_OBJECT_MISMACH: false, OPEN_IN_IE: false, ORDER_BY: '2',
    TEXT_MENU: '', TEXT_MENU_ITEM: 'שכר', TEXT_MENU_TARGET: '', TEXT_NATIV: '',
    TEXT_OBJECT_NAME: 'Salary',
    Menu_Params_list: [
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'COLOR', PARAMETER_VALUE: '#1E3BA2' },
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'Getdata', PARAMETER_VALUE: 'https://api-emp.example.il/GetSalary?' },
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'ORDER', PARAMETER_VALUE: '2' },
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'TITLE', PARAMETER_VALUE: 'שכר' },
    ],
  },
  {
    CODE_SUG_OBJECT: 1, ICON_URL: 'https://api.iconify.design/mdi/calendar-check.svg', IDNT_MENU_ITEM: 103, IDNT_MENU_ITEM_AV: '',
    IDNT_OBJECT: '1', LOGI_HTTPS: true, LOGI_PARTIAL_ICON_URL: false, LOGI_PARTIAL_URL: false,
    LOGI_PNIMI: false, LOGI_SUG_OBJECT_MISMACH: false, OPEN_IN_IE: false, ORDER_BY: '3',
    TEXT_MENU: '', TEXT_MENU_ITEM: 'נוכחות', TEXT_MENU_TARGET: '', TEXT_NATIV: '',
    TEXT_OBJECT_NAME: 'Attendance',
    Menu_Params_list: [
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'COLOR', PARAMETER_VALUE: '#C44D26' },
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'Getdata', PARAMETER_VALUE: 'https://api-emp.example.il/GetAttendance?' },
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'ORDER', PARAMETER_VALUE: '3' },
      { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'TITLE', PARAMETER_VALUE: 'נוכחות' },
    ],
  },
];

const MOCK_TAB_DATA: Record<string, TabData> = {
  GetDetails: {
    basicData: { 'שם מלא': 'דנה לוי', 'מספר עובד': '1001', 'תפקיד': 'מנהלת חשבונות', 'מחלקה': 'כספים' },
    murchavData: { 'תאריך כניסה': '01/03/2019', 'ותק': '5 שנים', 'היקף משרה': '100%', 'סוג חוזה': 'קבוע' },
    hatrraa: { 'תעודת זהות': 'תוקף בעוד 6 חודשים', 'הכשרה שנתית': 'חסרה' },
    links: { 'תיק עובד': 'https://example.il/employee/1001', 'אישורי העסקה': 'https://example.il/certs/1001' },
  },
  GetSalary: {
    basicData: { 'שכר ברוטו': '₪18,500', 'שכר נטו': '₪13,200', 'רכיב עיקרי': '₪15,000', 'תוספת ותק': '₪1,500' },
    murchavData: { 'ביטוח לאומי': '₪1,200', 'מס הכנסה': '₪3,100', 'ביטוח בריאות': '₪200', 'פנסיה': '₪1,800' },
    hatrraa: {},
    links: { 'תלוש שכר אחרון': 'https://example.il/payslip/1001' },
  },
  GetAttendance: {
    basicData: { 'ימי עבודה החודש': '22', 'ימי נוכחות': '20', 'ימי היעדרות': '2', 'שעות נוספות': '4' },
    murchavData: { 'ימי חופשה שנתית': '15 / 20', 'ימי מחלה השנה': '3', 'ימי כוננות': '0' },
    hatrraa: { 'איחורים החודש': '2 פעמים' },
    links: {},
  },
  GetMoreData: {
    basicData: { 'קוד שירות': 'SHR-2026', 'סטטוס': 'פעיל', 'אחראי': 'מחלקת HR' },
    murchavData: { 'תאריך פתיחה': '01/01/2026', 'תאריך עדכון': '10/05/2026' },
    hatrraa: {},
    links: { 'קישור לשירות': 'https://example.il/services/SHR-2026' },
  },
};

export function normalizeTab(raw: RawTabConfig): TabConfig {
  const getParam = (key: string) =>
    raw.Menu_Params_list.find(p => p.PARAMETER_KEY === key)?.PARAMETER_VALUE ?? '';

  return {
    id: raw.IDNT_MENU_ITEM,
    objectName: raw.TEXT_OBJECT_NAME,
    displayName: raw.TEXT_MENU_ITEM,
    title: getParam('TITLE'),
    color: getParam('COLOR'),
    order: Number(getParam('ORDER')),
    dataUrl: getParam('Getdata'),
    iconUrl: raw.ICON_URL,
    isInternal: raw.LOGI_PNIMI,
  };
}

export async function fetchTabsConfig(_employeeId: string): Promise<TabConfig[]> {
  if (!TABS_CONFIG_URL) {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_TABS.map(normalizeTab);
  }
  const res = await fetch(`${TABS_CONFIG_URL}?employeeId=${_employeeId}`);
  if (!res.ok) throw new Error('tabs config fetch failed');
  const raw: RawTabConfig[] = await res.json();
  return raw.map(normalizeTab);
}

export async function fetchTabData(dataUrl: string, employeeId: string): Promise<TabData> {
  if (!TABS_CONFIG_URL) {
    await new Promise(r => setTimeout(r, 300));
    const key = Object.keys(MOCK_TAB_DATA).find(k => dataUrl.includes(k)) ?? '';
    return MOCK_TAB_DATA[key] ?? { basicData: {}, murchavData: {}, hatrraa: {}, links: {} };
  }
  const res = await fetch(`${dataUrl}employeeId=${employeeId}`);
  if (!res.ok) throw new Error('tab data fetch failed');
  return res.json();
}
