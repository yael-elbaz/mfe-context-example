declare module 'shell/employeeStore' {
  export interface EmployeeProfile {
    id: string;
    employeeNumber: string;
    tz: string;
    firstName: string;
    lastName: string;
    yearsInCompany: number;
    unit: string;
    department: string;
    role: string;
    email: string;
    phone: string;
    image: string;
    skills: string[];
  }

  export const useEmployee: () => EmployeeProfile | null;
  export const useEmployeeLoading: () => boolean;
  export const useEmployeeStore: import('zustand').UseBoundStore<import('zustand').StoreApi<any>>;
}

declare module 'shell/mfeUsage' {
  import type { AxiosInstance } from 'axios';

  /** שם הכותרת שנשלחת בקריאה הראשונה של ה-MFE בטאב. */
  export const MFE_ID_HEADER: string;

  /** האם ה-MFE כבר דווח בטאב הנוכחי. */
  export function hasReportedMfeUsage(idntMfe: string): boolean;

  /** "תופס" את הדיווח הראשון — מחזיר true רק לקורא הראשון בטאב. */
  export function claimFirstMfeCall(idntMfe: string): boolean;

  /** משחרר את הדיווח כדי שהקריאה הבאה תנסה שוב. */
  export function releaseMfeCall(idntMfe: string): void;

  /** הרחבה ל-request config: `skipMfeUsage: true` מחריג קריאה מהספירה. */
  export interface MfeUsageRequestConfig {
    skipMfeUsage?: boolean;
  }

  /** מחבר את מנגנון הדירוג ל-axios instance. יש לקרוא פעם אחת ביצירת ה-instance. */
  export function attachMfeUsageInterceptor(instance: AxiosInstance, idntMfe: string): void;
}

declare module 'shell/SectionCard' {
  import type * as React from 'react';

  /** כפתור ה-options הסטנדרטי של הדר הסקשן — מוזרם ל-prop `actions`. */
  export const OptionsButton: React.FC<{ onClick?: () => void }>;

  export interface SectionCardProps {
    title: string;
    /** ברירת מחדל: "הצג הכל" ב-preview, "חזרה" במצב מלא */
    linkLabel?: string;
    count: number;
    countLabel: string;
    /** סלוט פעולות בהדר — פילטר, options, או כל שילוב. */
    actions?: React.ReactNode;
    /** מצב preview — הקישור בהדר עובר למצב מלא */
    onShowAll?: () => void;
    /** מצב מלא — הקישור בהדר חוזר ל-preview */
    backToPreview?: () => void;
    children: React.ReactNode;
  }

  const SectionCard: React.FC<SectionCardProps>;
  export default SectionCard;
}
