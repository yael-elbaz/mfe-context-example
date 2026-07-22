import { create } from 'zustand';
import type { SherutimStoredItem } from '../types';
import { getSherutimItems, type WorkUnit } from '../services/sherutimService';
import { getFavoriteSherutim, addFavorite, removeFavorite } from '../services/favoriteService';

// עוזר: מחזיר עותק של הרשימה כשה-isFavorite של שירות מסוים מוגדר לערך נתון.
function withFavoriteSet(items: SherutimStoredItem[], id: string, isFavorite: boolean): SherutimStoredItem[] {
  return items.map(it =>
    it.type === 'object' && it.id === id ? { ...it, isFavorite } : it
  );
}

type Status = 'idle' | 'loading' | 'loaded' | 'error';

interface SherutimStore {
  status: Status;
  unitId: string | null;        // היחידה שעבורה ה-items נטענו/נטענים
  items: SherutimStoredItem[];  // רשימה מעורבת: קטגוריות ('self') + שירותים ('object' עם isFavorite צרוב)
  error?: unknown;
  fetchOnce: (currentYechida: WorkUnit) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

// ידית ההבטחה הפעילה (מחוץ ל-state) לאיחוד בקשות מקבילות. זהות היחידה נשמרת ב-state
// עצמו (unitId) — המקור-אמת היחיד (singleton) — ולא במשתנה מודול נפרד.
let inFlight: Promise<void> | null = null;

export const useSherutimStore = create<SherutimStore>((set, get) => ({
  status: 'idle',
  unitId: null,
  items: [],

  fetchOnce: (currentYechida) => {
    const unitId = currentYechida.id;
    const s = get();

    // 1) כבר נטען עבור אותה יחידה — אין רשת.
    if (s.status === 'loaded' && s.unitId === unitId) return Promise.resolve();
    // 2) בקשה כבר בתהליך עבור אותה יחידה — מחכים לאותה ההבטחה.
    if (inFlight && s.status === 'loading' && s.unitId === unitId) return inFlight;

    // 3) יחידה חדשה (או טעינה ראשונה) — מאתחלים את כל הרשימה וטוענים מחדש.
    set({ status: 'loading', unitId, items: [], error: undefined });

    inFlight = Promise.all([
      getSherutimItems(currentYechida),
      getFavoriteSherutim(),
    ])
      .then(([rawItems, favorites]) => {
        // אם בינתיים המשתמש כבר עבר ליחידה אחרת — מתעלמים מתוצאה ישנה.
        if (get().unitId !== unitId) return;
        // צורבים isFavorite על כל שירות לפי רשימת המועדפים; קטגוריות עוברות כמו שהן.
        const favIds = new Set(favorites.map(f => f.id));
        set({
          status: 'loaded',
          unitId,
          items: rawItems.map(it =>
            it.type === 'object' ? { ...it, isFavorite: favIds.has(it.id) } : it
          ),
        });
      })
      .catch((error) => {
        if (get().unitId !== unitId) return;
        set({ status: 'error', error });
      })
      .finally(() => {
        // מנקים רק אם ההבטחה הנוכחית עדיין שייכת ליחידה הפעילה.
        if (get().unitId === unitId) inFlight = null;
      });

    return inFlight;
  },

  // הופך שירות למועדף/לא-מועדף: עדכון אופטימי מיידי (singleton — כל התצוגות מתעדכנות),
  // קריאה לשרת לשמירת הבחירה, ו-rollback אם השמירה נכשלה.
  toggleFavorite: async (id) => {
    const target = get().items.find(it => it.type === 'object' && it.id === id);
    if (!target || target.type !== 'object') return;

    const willFav = !target.isFavorite;

    // 1) עדכון אופטימי — ה-UI מתעדכן מיד.
    set((s) => ({ items: withFavoriteSet(s.items, id, willFav) }));

    // 2) שמירה בשרת.
    try {
      if (willFav) await addFavorite(id);
      else await removeFavorite(id);
    } catch (error) {
      // 3) rollback — מחזירים את הפריט למצבו הקודם.
      set((s) => ({ items: withFavoriteSet(s.items, id, !willFav) }));
      console.error('[sherutim] toggleFavorite failed, rolled back', error);
    }
  },
}));

// debug only
(window as any).__sherutimStore = useSherutimStore;
