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
