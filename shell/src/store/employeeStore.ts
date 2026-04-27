import { create } from 'zustand';

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

interface EmployeeState {
  employee: EmployeeProfile | null;
  loading: boolean;
  setEmployee: (employee: EmployeeProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employee: null,
  loading: false,
  setEmployee: (employee) => set({ employee }),
  setLoading: (loading) => set({ loading }),
}));

// debug only
(window as any).__employeeStore = useEmployeeStore;

// Public read-only API — write access is intentionally not exported
export const useEmployee = () => useEmployeeStore((s) => s.employee);
export const useEmployeeLoading = () => useEmployeeStore((s) => s.loading);
