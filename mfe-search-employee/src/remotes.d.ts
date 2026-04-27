declare module 'shell/store' {
  export interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
  }

  export interface WorkUnit {
    id: string;
    name: string;
    department: string;
  }

  export const useUser: () => User | null;
  export const useSelectedUnit: () => WorkUnit | null;
  export const useAvailableUnits: () => WorkUnit[];
  export const useAppContext: import('zustand').UseBoundStore<import('zustand').StoreApi<any>>;
}
