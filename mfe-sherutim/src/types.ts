export type ServiceMeta = {
  [key: string]: string | number | boolean | ServiceMeta;
};

export type OpenService = (meta: any) => void;

// קטגוריה בתפריט (type: 'self') מקבצת שירותים רגילים (type: 'new') לפי idntObjectAv === idntObject
export interface SherutCategory {
  type: 'self';
  id: string;
  idntObject: number;
  title: string;
  iconUrl: string; // אייקון המייצג את הקטגוריה (בפרודקשן: URL לקובץ; כאן: data-URI)
}

export interface Sherut {
  type: 'new';
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
