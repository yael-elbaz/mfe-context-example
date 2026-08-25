import axios from 'axios';
import { attachMfeUsageInterceptor } from 'shell/mfeUsage';

/**
 * ה-axios instance של mfe-employee-portfolio.
 * כל קריאת רשת של ה-MFE צריכה לעבור דרכו — רק כך הקריאה הראשונה בטאב
 * תישא את כותרת ה-idntMfe וה-middleware בשרת יספור את השימוש.
 */

/** המזהה הייחודי של ה-MFE. חייב להתאים למה שה-middleware בשרת מכיר. */
export const IDNT_MFE: string = import.meta.env.VITE_IDNT_MFE ?? 'mfe-employee-portfolio';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
});

attachMfeUsageInterceptor(http, IDNT_MFE);
