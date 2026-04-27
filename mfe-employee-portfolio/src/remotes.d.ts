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

declare module 'shell/employeeStore' {
  export interface EmployeeProfile {
    id: string;
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
