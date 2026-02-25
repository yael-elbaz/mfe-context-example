import { create } from 'zustand';

// ---- טיפוסים ----

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

interface AppContextState {
  user: User | null;
  selectedUnit: WorkUnit | null;
  availableUnits: WorkUnit[];

  // פעולות
  setUser: (user: User) => void;
  setSelectedUnit: (unit: WorkUnit) => void;
  logout: () => void;
}

// ---- הסטור ----

export const useAppContext = create<AppContextState>((set) => ({
  user: null,
  selectedUnit: null,
  availableUnits: [],

  setUser: (user) => set({ user }),

  setSelectedUnit: (unit) => set({ selectedUnit: unit }),

  logout: () => set({ user: null, selectedUnit: null, availableUnits: [] }),
}));

// ---- Convenience hooks (אופציונלי, נוח לצריכה ב-MFEs) ----

export const useUser = () => useAppContext((s) => s.user);
export const useSelectedUnit = () => useAppContext((s) => s.selectedUnit);
export const useAvailableUnits = () => useAppContext((s) => s.availableUnits);
