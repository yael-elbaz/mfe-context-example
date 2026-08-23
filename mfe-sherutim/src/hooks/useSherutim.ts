import { useEffect, useMemo } from 'react';
import type { SherutCategory, SherutWithFavorite } from '../types';
import { useSherutimStore } from '../store/sherutimStore';
import { useSelectedUnit } from 'shell/store';

// קטגוריה יחד עם רשימת השירותים שמשויכים אליה
export interface CategoryWithSherutim {
  category: SherutCategory;
  sherutim: SherutWithFavorite[];
}

export interface UseSherutimResult {
  // מפה של קטגוריה -> השירותים שלה (כל שירות עם isFavorite)
  categories: CategoryWithSherutim[];
  // כל השירותים בצורה שטוחה (כל שירות עם isFavorite) — נוח לחיפוש חופשי
  sherutim: SherutWithFavorite[];
  // רשימת כל המועדפים (כל שירות עם isFavorite: true)
  favorites: SherutWithFavorite[];
  // האם הנתונים עדיין נטענים
  loading: boolean;
}

// re-export לנוחות צרכנים קיימים
export type { SherutWithFavorite };

/**
 * קורא את השירותים מתוך ה-store המשותף (fetch פעם אחת לכל הסשן) עבור היחידה הנבחרת.
 * ה-isFavorite כבר צרוב על כל שירות ב-store; כאן רק מפרידים לקטגוריות/שירותים/מועדפים.
 */
export function useSherutim(): UseSherutimResult {
  const unit = useSelectedUnit();
  const status = useSherutimStore(s => s.status);
  const items = useSherutimStore(s => s.items);
  const fetchOnce = useSherutimStore(s => s.fetchOnce);

  // מפעיל fetch פעם אחת כשיש יחידה נבחרת; אידמפוטנטי — בטוח גם כששני התצוגות
  // (Preview/Full) עולות יחד, כי ה-store מאחד את הבקשה.
  useEffect(() => {
    if (unit) fetchOnce(unit);
  }, [unit, fetchOnce]);

  // הפריטים מגיעים ברשימה אחת מעורבת — מפרידים לפי type:
  // 'self' = קטגוריה, 'object' = שירות רגיל (כבר עם isFavorite).
  const categoryList = useMemo(
    () => items.filter((i): i is SherutCategory => i.type === 'self'),
    [items],
  );

  const withFavorite = useMemo<SherutWithFavorite[]>(
    () => items.filter((i): i is SherutWithFavorite => i.type === 'object'),
    [items],
  );

  const categories = useMemo<CategoryWithSherutim[]>(
    () => categoryList.map(category => ({
      category,
      sherutim: withFavorite.filter(s => s.idntObjectAv === category.idntObject),
    })),
    [categoryList, withFavorite],
  );

  const favoriteList = useMemo<SherutWithFavorite[]>(
    () => withFavorite.filter(s => s.isFavorite),
    [withFavorite],
  );

  return {
    categories,
    sherutim: withFavorite,
    favorites: favoriteList,
    loading: status !== 'loaded',
  };
}
