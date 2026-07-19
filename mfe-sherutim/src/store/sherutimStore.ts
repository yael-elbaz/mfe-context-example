import { create } from 'zustand';
import type { SherutimItem } from '../types';
import { getSherutimItems } from '../services/sherutimService';
import { getFavoriteSherutim } from '../services/favoriteService';

type Status = 'idle' | 'loading' | 'loaded' | 'error';

interface SherutimStore {
  status: Status;
  items: SherutimItem[];    // רשימה מעורבת: קטגוריות ('self') + שירותים ('object')
  favoriteIds: string[];    // מזהי השירותים המסומנים כמועדפים
  error?: unknown;
  fetchOnce: () => Promise<void>;
}

// הבטחה ברמת-המודול (מחוץ ל-state של zustand) שמאחדת בקשות מקבילות:
// אם fetch כבר בתהליך, קורא נוסף מקבל את אותה ההבטחה במקום לפתוח בקשה חדשה.
let inFlight: Promise<void> | null = null;

export const useSherutimStore = create<SherutimStore>((set, get) => ({
  status: 'idle',
  items: [],
  favoriteIds: [],
  fetchOnce: () => {
    // 1) כבר נטען — אין רשת.
    if (get().status === 'loaded') return Promise.resolve();
    // 2) בקשה כבר בתהליך — מחכים לאותה ההבטחה.
    if (inFlight) return inFlight;
    // 3) פותחים בקשה חדשה.
    set({ status: 'loading', error: undefined });
    inFlight = Promise.all([getSherutimItems(), getFavoriteSherutim()])
      .then(([items, favorites]) => {
        set({
          status: 'loaded',
          items,
          favoriteIds: favorites.map(f => f.id),
        });
      })
      .catch((error) => {
        set({ status: 'error', error });
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  },
}));

// debug only
(window as any).__sherutimStore = useSherutimStore;
