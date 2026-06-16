import { createGlobalStore } from './createGlobalStore';

export interface EmployeeProfile {
  type: 'employee';
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

export interface CustomerProfile {
  type: 'customer';
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  memberSince: string;
}

export type AnyPerson = EmployeeProfile | CustomerProfile;

interface SelectedPersonStore {
  person: AnyPerson | null;
  isLoadingPerson: boolean;
  setSelectedPerson: (person: AnyPerson) => void;
  clearSelectedPerson: () => void;
  setIsLoadingPerson: (loading: boolean) => void;
}

export const useSelectedPersonStore = createGlobalStore<SelectedPersonStore>(
  '__mfe_selectedPersonStore__',
  (set) => ({
    person: null,
    isLoadingPerson: false,
    setSelectedPerson: (person) => set({ person }),
    clearSelectedPerson: () => set({ person: null }),
    setIsLoadingPerson: (loading) => set({ isLoadingPerson: loading }),
  }),
);

// debug only
(window as any).__personStore = useSelectedPersonStore;

// Generic hooks — for code that handles any person type
export const useSelectedPerson = () => useSelectedPersonStore((s) => s.person);
export const useSelectedPersonType = () => useSelectedPersonStore((s) => s.person?.type ?? null);
export const useIsLoadingPerson = () => useSelectedPersonStore((s) => s.isLoadingPerson);

// Type-narrowed hooks — each consumer gets an exactly-typed object or null
export const useCurrentEmployee = () => {
  const person = useSelectedPersonStore((s) => s.person);
  if (person?.type !== 'employee') return null;
  return person; // TypeScript: EmployeeProfile
};

export const useCurrentCustomer = () => {
  const person = useSelectedPersonStore((s) => s.person);
  if (person?.type !== 'customer') return null;
  return person; // TypeScript: CustomerProfile
};
