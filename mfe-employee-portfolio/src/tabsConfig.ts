import type { RawTabConfig, TabConfig, TabData } from './types';
import { http } from './services/http';

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
  // טאבים נוספים — יש להם נתונים רק אצל העובדים עם המידע הרב (MOCK_TAB_DATA_BY_EMPLOYEE),
  // ולכן אצל השאר הם מוסתרים (טאב בלי נתונים לא מוצג)
  ...([
    ['ביטחון', 'Security', 'shield-outline', '#4A5568'],
    ['השכלה', 'Education', 'school-outline', '#2B6CB0'],
    ['הכשרות', 'Training', 'certificate-outline', '#2F855A'],
    ['רכב', 'Vehicle', 'car-outline', '#B7791F'],
    ['ציוד', 'Equipment', 'laptop', '#6B46C1'],
    ['הערכות', 'Reviews', 'star-outline', '#D69E2E'],
    ['משמעת', 'Discipline', 'gavel', '#C53030'],
    ['שחרור', 'Release', 'logout', '#718096'],
  ] as const).map(([title, name, icon, color], i): RawTabConfig => {
    const order = String(4 + i);
    return {
      CODE_SUG_OBJECT: 1, ICON_URL: `https://api.iconify.design/mdi/${icon}.svg`, IDNT_MENU_ITEM: 104 + i, IDNT_MENU_ITEM_AV: '',
      IDNT_OBJECT: '1', LOGI_HTTPS: true, LOGI_PARTIAL_ICON_URL: false, LOGI_PARTIAL_URL: false,
      LOGI_PNIMI: false, LOGI_SUG_OBJECT_MISMACH: false, OPEN_IN_IE: false, ORDER_BY: order,
      TEXT_MENU: '', TEXT_MENU_ITEM: title, TEXT_MENU_TARGET: '', TEXT_NATIV: '',
      TEXT_OBJECT_NAME: name,
      Menu_Params_list: [
        { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'COLOR', PARAMETER_VALUE: color },
        { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'Getdata', PARAMETER_VALUE: `https://api-emp.example.il/Get${name}?` },
        { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'ORDER', PARAMETER_VALUE: order },
        { CODE_SUG_PARAMETER: '', PARAMETER_KEY: 'TITLE', PARAMETER_VALUE: title },
      ],
    };
  }),
];

const EMPTY_TAB_DATA: TabData = { basicData: {}, murchavData: {}, hatrraa: {}, links: {} };

// עובדים לבדיקת עומס: 1009 — הרבה שדות, התראות, לינקים וטאבים; 1010 — ערכים ארוכים מאוד
const MOCK_TAB_DATA_BY_EMPLOYEE: Record<string, Record<string, TabData>> = {
  '1009': {
    GetDetails: {
      basicData: {
        'שם מלא': 'עומר נחום', 'מספר עובד': '1009', 'תפקיד': 'ראש צוות תפעול', 'מחלקה': 'תפעול',
        'יחידה': 'מרחב צפון', 'דרגה': 'רס״ב', 'מעמד': 'קבע', 'מנהל ישיר': 'יעל שרון',
        'מיקום': 'חיפה', 'טלפון': '052-9988776', 'דוא״ל': 'omer.nahum@org.co.il', 'מצב משפחתי': 'נשוי + 3',
      },
      murchavData: {
        'תאריך כניסה': '12/08/2011', 'ותק': '15 שנים', 'היקף משרה': '100%', 'סוג חוזה': 'קבוע',
        'תאריך לידה': '04/02/1984', 'עיר מגורים': 'קריית ביאליק', 'שפות': 'עברית, אנגלית, רוסית',
        'קבוצת דם': 'A+', 'סיווג ביטחוני': 'סודי', 'מספר רישיון': '7781234', 'קוד שכר': 'B-14',
        'מרכז עלות': '4410', 'תאריך קידום אחרון': '01/01/2024', 'תאריך הערכה הבאה': '15/12/2026',
        'שעות שבועיות': '42.5', 'אתר עבודה משני': 'נמל חיפה',
      },
      hatrraa: {
        'תעודת זהות': 'תוקף בעוד חודשיים', 'הכשרה שנתית': 'חסרה', 'בדיקה רפואית': 'פגה לפני שבוע',
        'סיווג ביטחוני': 'נדרש חידוש', 'טופס 101': 'לא הוגש', 'חוזה': 'מסתיים בעוד 3 חודשים',
      },
      links: {
        'תיק עובד': 'https://example.il/employee/1009', 'אישורי העסקה': 'https://example.il/certs/1009',
        'תיק רפואי': 'https://example.il/medical/1009', 'היסטוריית תפקידים': 'https://example.il/roles/1009',
        'טפסים': 'https://example.il/forms/1009',
      },
    },
    GetSalary: {
      basicData: {
        'שכר ברוטו': '₪24,800', 'שכר נטו': '₪16,950', 'רכיב עיקרי': '₪19,000', 'תוספת ותק': '₪2,300',
        'תוספת פיקוד': '₪1,500', 'החזר נסיעות': '₪640', 'שעות נוספות': '₪1,360', 'דרגת שכר': '14',
      },
      murchavData: {
        'ביטוח לאומי': '₪1,650', 'מס הכנסה': '₪4,900', 'ביטוח בריאות': '₪310', 'פנסיה': '₪1,980',
        'קרן השתלמות': '₪620', 'נקודות זיכוי': '5.25', 'בנק': 'לאומי 10-845', 'חשבון': '12345678',
        'הלוואה פעילה': '₪25,000', 'יתרת הלוואה': '₪11,200', 'קיזוז ציוד': '₪0', 'מענק שנתי': '₪6,000',
      },
      hatrraa: { 'תיאום מס': 'פג תוקף', 'הלוואה': 'תשלום אחרון בעוד חודש' },
      links: { 'תלוש שכר אחרון': 'https://example.il/payslip/1009', 'טופס 106': 'https://example.il/106/1009' },
    },
    GetAttendance: {
      basicData: {
        'ימי עבודה החודש': '22', 'ימי נוכחות': '18', 'ימי היעדרות': '4', 'שעות נוספות': '17',
        'איחורים': '3', 'יציאות מוקדמות': '1', 'משמרות לילה': '6',
      },
      murchavData: {
        'ימי חופשה שנתית': '9 / 24', 'ימי מחלה השנה': '11', 'ימי כוננות': '8', 'ימי מילואים': '21',
        'עבודה מהבית': '2 ימים בשבוע', 'שעון נוכחות': 'כרטיס 5521', 'משמרת קבועה': 'בוקר',
      },
      hatrraa: { 'איחורים החודש': '3 פעמים', 'ימי מחלה': 'מעל הממוצע', 'חופשה צבורה': 'עומדת לפוג' },
      links: { 'דוח נוכחות': 'https://example.il/attendance/1009' },
    },
    GetSecurity: {
      basicData: { 'סיווג': 'סודי', 'תאריך סיווג': '03/05/2020', 'תוקף': '03/05/2026', 'גורם מאשר': 'קב״ט מרחב' },
      murchavData: { 'תחקיר אחרון': '2020', 'הרשאות כניסה': 'בסיס צפון, נמל חיפה', 'כרטיס כניסה': '88-1234' },
      hatrraa: { 'סיווג': 'פג תוקף' },
      links: {},
    },
    GetEducation: {
      basicData: { 'השכלה': 'תואר ראשון', 'מוסד': 'הטכניון', 'תחום': 'הנדסת תעשייה וניהול', 'שנת סיום': '2009' },
      murchavData: { 'תואר שני': 'בלימודים', 'מוסד תואר שני': 'אוניברסיטת חיפה', 'מימון': 'קרן השתלמות' },
      hatrraa: {},
      links: { 'תעודות': 'https://example.il/edu/1009' },
    },
    GetTraining: {
      basicData: { 'קורסים שהושלמו': '14', 'שעות הכשרה השנה': '36', 'קורס אחרון': 'ניהול צוותים', 'קורס הבא': 'בטיחות בעבודה' },
      murchavData: { 'עזרה ראשונה': 'בתוקף', 'מלגזה': 'בתוקף', 'עבודה בגובה': 'פג', 'כיבוי אש': 'בתוקף' },
      hatrraa: { 'עבודה בגובה': 'נדרש רענון' },
      links: {},
    },
    GetVehicle: {
      basicData: { 'רכב צמוד': 'כן', 'דגם': 'סקודה אוקטביה', 'מספר רישוי': '12-345-67', 'קבוצת רכב': '3' },
      murchavData: { 'ק״מ החודש': '2,140', 'דלקן': '4421', 'שווי שימוש': '₪3,010' },
      hatrraa: {},
      links: {},
    },
    GetEquipment: {
      basicData: { 'מחשב נייד': 'Dell 7440', 'טלפון': 'iPhone 15', 'כרטיס חכם': 'כן' },
      murchavData: { 'מספר נכס מחשב': 'IT-55120', 'מספר נכס טלפון': 'IT-55121' },
      hatrraa: {},
      links: {},
    },
    GetReviews: {
      basicData: { 'ציון אחרון': '4.6 / 5', 'שנת הערכה': '2025', 'מעריך': 'יעל שרון' },
      murchavData: { 'ציון קודם': '4.3 / 5', 'יעדים שהושגו': '7 / 8' },
      hatrraa: {},
      links: { 'טופס הערכה': 'https://example.il/review/1009' },
    },
    GetDiscipline: {
      basicData: { 'הליכים פתוחים': '0', 'הליכים סגורים': '1' },
      murchavData: {},
      hatrraa: {},
      links: {},
    },
    GetRelease: {
      basicData: { 'תאריך שחרור צפוי': '08/2031', 'זכאות לפנסיה': 'מלאה' },
      murchavData: { 'מענק שחרור משוער': '₪180,000' },
      hatrraa: {},
      links: {},
    },
  },
  '1010': {
    GetDetails: {
      basicData: {
        'שם מלא': 'תמר אדלר', 'מספר עובד': '1010',
        'תפקיד': 'אחראית תחום רכש, התקשרויות ומכרזים בינלאומיים',
        'מחלקה': 'אגף לוגיסטיקה, רכש ושרשרת אספקה',
        'מנהל ישיר': 'פרופ׳ אלכסנדר בן־ציון רוזנבלום',
        'מיקום': 'קריית הממשלה, מגדל צפוני, קומה 14, חדר 1407',
      },
      murchavData: {
        'הערה כללית': 'העובדת נמצאת בתהליך מעבר בין יחידות ויש לעדכן את כל ההרשאות בהתאם עד סוף הרבעון',
        'כתובת מגורים': 'רחוב הרב קוק 128, דירה 42, מבשרת ציון',
        'תאריך כניסה': '15/02/2016',
        'סוג חוזה': 'חוזה אישי לתקופה קצובה עם אופציה להארכה',
      },
      hatrraa: { 'מעבר יחידה': 'יש לעדכן הרשאות לפני 31/12 — אחרת הגישה למערכות הרכש תיחסם אוטומטית' },
      links: { 'תיק עובד': 'https://example.il/employee/1010' },
    },
  },
};

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

// The tab menu structure (labels, colors, order, icons) is permanent/global — it's
// the same for every employee and for the lifetime of the session. Fetch it once and
// reuse the result so changes to employeeId / extendedTabDataUrl / selectedActiveTab
// don't trigger a redundant config fetch. Only per-employee tab *data* (fetchTabData)
// needs to be re-acquired. The cache is cleared on failure so a later mount can retry.
let tabsConfigCache: Promise<TabConfig[]> | null = null;

export function fetchTabsConfig(): Promise<TabConfig[]> {
  if (!tabsConfigCache) {
    tabsConfigCache = loadTabsConfig().catch(err => {
      tabsConfigCache = null;
      throw err;
    });
  }
  // Hand callers a fresh array copy — loadTabs pushes/sorts into it, and we must not
  // mutate the shared cached array.
  return tabsConfigCache.then(tabs => [...tabs]);
}

async function loadTabsConfig(): Promise<TabConfig[]> {
  if (!TABS_CONFIG_URL) {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_TABS.map(normalizeTab);
  }
  const { data } = await http.get<RawTabConfig[]>(TABS_CONFIG_URL);
  return data.map(normalizeTab);
}

export async function fetchTabData(dataUrl: string, employeeId: string): Promise<TabData> {
  if (!TABS_CONFIG_URL) {
    await new Promise(r => setTimeout(r, 300));
    // "Get<Name>?" מתוך ה-URL — התאמה מדויקת, כדי ש-GetDetails לא יתפוס גם טאב אחר
    const key = dataUrl.match(/\/(Get\w+)\?/)?.[1] ?? '';
    return MOCK_TAB_DATA_BY_EMPLOYEE[employeeId]?.[key] ?? MOCK_TAB_DATA[key] ?? EMPTY_TAB_DATA;
  }
  const { data } = await http.get<TabData>(`${dataUrl}employeeId=${employeeId}`);
  return data;
}
