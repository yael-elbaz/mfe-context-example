declare module 'shell/openService' {
  export type ServiceMeta = {
    [key: string]: string | number | boolean | ServiceMeta;
  };
  export type OpenService = (meta: ServiceMeta) => void;
}

declare module 'shell/store' {
  export interface WorkUnit {
    id: string;
    name: string;
    department: string;
  }
  // ה-hook הנוח לצריכת היחידה הנבחרת מתוך appContext של ה-shell
  export const useSelectedUnit: () => WorkUnit | null;
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
    linkLabel: string;
    count: number;
    countLabel: string;
    /** סלוט פעולות בהדר — פילטר, options, או כל שילוב. */
    actions?: React.ReactNode;
    onLinkClick?: () => void;
    children: React.ReactNode;
  }

  const SectionCard: React.FC<SectionCardProps>;
  export default SectionCard;
}
