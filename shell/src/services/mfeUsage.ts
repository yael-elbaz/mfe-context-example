import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * דירוג שימוש ב-MFE — כל MFE מזוהה ב-idntMfe ומדווח *פעם אחת בלבד* לכל טאב.
 *
 * הרעיון: ה-interceptor מוסיף את הכותרת `X-Idnt-Mfe` רק לקריאה הראשונה של אותו MFE
 * בטאב הנוכחי. ה-middleware בצד השרת סופר בקשות שנושאות את הכותרת, וכך מקבלים
 * "כמה פעמים המשתמש נכנס ל-MFE" ולא "כמה בקשות רשת ה-MFE ביצע".
 *
 * למה sessionStorage ולא localStorage: הדרישה היא ספירה לכל טאב — sessionStorage
 * מבודד לכל טאב מעצמו ומתאפס בסגירתו, בדיוק ההתנהגות הרצויה.
 */

export const MFE_ID_HEADER = 'X-Idnt-Mfe';

const STORAGE_PREFIX = 'mfeUsage:firstCall:';

// מראה בזיכרון — נדרשת כשה-sessionStorage חסום (מצב פרטי, iframe עם cookies חסומים).
// בלעדיה ה-interceptor היה מוסיף את הכותרת לכל בקשה במקום לראשונה בלבד.
const claimedInMemory = new Set<string>();

// סימון פנימי על ה-config: הבקשה הזו היא זו שנשאה את הכותרת.
// מאפשר לשחרר את ה-claim אם הבקשה כלל לא הגיעה לשרת.
const CARRIED_HEADER = Symbol('mfeUsage.carriedHeader');

type TrackedConfig = InternalAxiosRequestConfig &
  MfeUsageRequestConfig & { [CARRIED_HEADER]?: true };

function storageKey(idntMfe: string): string {
  return `${STORAGE_PREFIX}${idntMfe}`;
}

/** האם ה-MFE כבר דווח בטאב הנוכחי. */
export function hasReportedMfeUsage(idntMfe: string): boolean {
  if (claimedInMemory.has(idntMfe)) return true;
  try {
    return sessionStorage.getItem(storageKey(idntMfe)) !== null;
  } catch {
    return false;
  }
}

/**
 * "תופס" את הדיווח הראשון של ה-MFE בטאב.
 * מחזיר true רק לקורא הראשון — כל קריאה נוספת תקבל false.
 *
 * הגוף רץ סינכרונית מקצה לקצה, ולכן גם אם כמה בקשות נשלחות במקביל בזמן טעינת
 * ה-MFE — רק אחת מהן תזכה ב-true.
 */
export function claimFirstMfeCall(idntMfe: string): boolean {
  if (hasReportedMfeUsage(idntMfe)) return false;
  claimedInMemory.add(idntMfe);
  try {
    sessionStorage.setItem(storageKey(idntMfe), String(Date.now()));
  } catch {
    // אין הרשאת אחסון — המראה בזיכרון מספיקה לאורך חיי הדף
  }
  return true;
}

/** משחרר את הדיווח כדי שהקריאה הבאה תנסה שוב (בקשה שלא הגיעה לשרת / logout / בדיקות). */
export function releaseMfeCall(idntMfe: string): void {
  claimedInMemory.delete(idntMfe);
  try {
    sessionStorage.removeItem(storageKey(idntMfe));
  } catch {
    // אין הרשאת אחסון — אין מה לנקות
  }
}

/** הרחבה ל-request config: מאפשרת להחריג קריאה מהספירה (health-check, polling וכו'). */
export interface MfeUsageRequestConfig {
  /** אם true — הבקשה לעולם לא תישא את כותרת ה-idntMfe ולא "תשרוף" את הדיווח הראשון. */
  skipMfeUsage?: boolean;
}

/**
 * מחבר את מנגנון הדירוג ל-axios instance של MFE מסוים.
 * יש לקרוא פעם אחת, בזמן יצירת ה-instance.
 *
 * @param instance ה-axios instance של ה-MFE
 * @param idntMfe  המזהה הייחודי של ה-MFE (זהה למה שה-middleware בשרת מצפה לו)
 */
export function attachMfeUsageInterceptor(instance: AxiosInstance, idntMfe: string): void {
  instance.interceptors.request.use((config: TrackedConfig) => {
    if (config.skipMfeUsage) return config;
    if (!claimFirstMfeCall(idntMfe)) return config;

    // axios v1 — headers הוא AxiosHeaders; ה-fallback מכסה instances ישנים/מוקים
    if (typeof config.headers?.set === 'function') {
      config.headers.set(MFE_ID_HEADER, idntMfe);
    } else {
      (config.headers as Record<string, unknown>)[MFE_ID_HEADER] = idntMfe;
    }
    config[CARRIED_HEADER] = true;
    return config;
  });

  // אם הבקשה שנשאה את הכותרת כלל לא הגיעה לשרת (נפילת רשת / ביטול) — משחררים את
  // הדיווח כדי שלא "נאבד" את הספירה של ה-MFE לכל אורך חיי הטאב.
  // שגיאת שרת (4xx/5xx) *כן* נספרת: ה-middleware כבר ראה את הכותרת.
  instance.interceptors.response.use(undefined, (error: AxiosError) => {
    const config = error.config as TrackedConfig | undefined;
    if (config?.[CARRIED_HEADER] && !error.response) {
      releaseMfeCall(idntMfe);
    }
    return Promise.reject(error);
  });
}
