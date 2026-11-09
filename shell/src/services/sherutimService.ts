import type { PersonType, OverlaySize } from '../types/openService';

export interface SherutMfeConfig {
  remoteUrl: string;
  scope: string;
  module: string;
  objectType?: PersonType[] | null;
  selectedActiveTab?: number;
  // Only the data URL for the "more data" tab varies per-sherut; the tab's label,
  // color and active behavior are fixed constants inside mfe-employee-portfolio.
  extendedTabDataUrl?: string;
  /** 'overlay' — בתוך תיק השירות מוצג בחלון צף מעל האובייקטים הדיגיטליים; אחרת — דף מלא */
  displaySettings?: 'overlay';
  /** גודל פתיחה של האוברליי, ברירת מחדל 'm' */
  overlaySize?: OverlaySize;
  /** כותרת חלון האוברליי */
  title?: string;
}

// עד שה-API יחזיר את הגדרות התצוגה — שירותי האוברליי של ה-mock (כמו ב-mfe-sherutim/mockData)
const MOCK_OVERLAY: Record<string, Pick<SherutMfeConfig, 'overlaySize' | 'title'>> = {
  SHR004: { overlaySize: 'm', title: 'בקשת ציוד משרדי' },
  SHR006: { overlaySize: 's', title: 'בקשת הלוואה' },
  // "עריכה" ברשומה של אובייקט דיגיטלי (mfe-digital-objects)
  SHR009: { overlaySize: 'm', title: 'עריכת אובייקט דיגיטלי' },
};

// In production this would be a real API call:
// fetch(`/api/sherutim/${idntSheryut}/mfe-config`)
export async function getSherutMfeConfig(idntSheryut: string): Promise<SherutMfeConfig> {
  await new Promise(r => setTimeout(r, 300));
  const overlay = MOCK_OVERLAY[idntSheryut];
  return {
    remoteUrl: 'http://localhost:3005/assets/remoteEntry.js',
    scope: 'mfe_sherut_exemplat',
    module: './App',
    objectType: ['employee'],
    extendedTabDataUrl: 'https://api-sherut.example.il/GetMoreData?',
    ...(overlay && { displaySettings: 'overlay' as const, ...overlay }),
  };
}

// In production: fetch(`/api/sherutim/${idntSheryut}/validate`)
export async function validateSherutId(idntSheryut: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200));
  return /^\d+$/.test(idntSheryut) && idntSheryut.length > 0;
}
