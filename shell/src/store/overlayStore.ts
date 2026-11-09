import { create } from 'zustand';

/**
 * אוברליי שירות — "רק אחד פתוח בכל פעם".
 * פנימי ל-shell (לא נחשף ל-MFEs): SherutOverlayView מסמן שיש אוברליי פתוח,
 * useOpenService חוסם אוברליי שני ומעלה את nudgeCount, ו-ServiceOverlay מהבהב בכל שינוי שלו.
 */
interface OverlayStore {
  /** השירות הפתוח באוברליי (null — אין) */
  openServiceId: string | null;
  /** עולה ב-1 בכל ניסיון חסום לפתוח אוברליי שני — מונה ולא boolean, כדי שגם לחיצה חוזרת תהבהב */
  nudgeCount: number;
  setOpen: (id: string | null) => void;
  nudge: () => void;
}

export const useOverlayStore = create<OverlayStore>((set) => ({
  openServiceId: null,
  nudgeCount: 0,
  setOpen: (id) => set({ openServiceId: id }),
  nudge: () => set((s) => ({ nudgeCount: s.nudgeCount + 1 })),
}));
