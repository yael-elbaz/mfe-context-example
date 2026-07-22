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
