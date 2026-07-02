export type ServiceMeta = {
  [key: string]: string | number | boolean | ServiceMeta;
};

export type OpenService = (meta: any) => void;

// כל הפריטים מגיעים מהשרת ברשימה אחת; מבדילים לפי type:
// 'self' = קטגוריה, 'object' = שירות רגיל. קטגוריה מקבצת שירותים לפי idntObjectAv === idntObject
export interface SherutCategory {
  type: 'self';
  id: string;
  idntObject: number;
  title: string;
  iconUrl: string; // אייקון המייצג את הקטגוריה (בפרודקשן: URL לקובץ; כאן: data-URI)
}

export interface Sherut {
  type: 'object';
  id: string;
  idntSheryut: string;
  title: string;
  status: 'פתוח' | 'ממתין' | 'הושלם';
  mfeUrl: string;
  mfeScope: string;
  mfeModule: string;
  idntObjectAv: number;
}

export type SherutimItem = SherutCategory | Sherut;
