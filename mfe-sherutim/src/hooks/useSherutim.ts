import { useEffect, useMemo } from 'react';
import type { Sherut, SherutCategory } from '../types';
import { useSherutimStore } from '../store/sherutimStore';

// שירות עם דגל האם הוא מסומן כמועדף
export interface SherutWithFavorite extends Sherut {
  isFavorite: boolean;
}

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

/**
 * קורא את השירותים הגלובליים מתוך ה-store המשותף (fetch פעם אחת לכל הסשן),
 * בונה מפה של קטגוריות -> שירותים כאשר לכל שירות מצורף isFavorite,
 * ומחזיר בנוסף את רשימת המועדפים בנפרד.
 */
export function useSherutim(): UseSherutimResult {
  const status = useSherutimStore(s => s.status);
  const items = useSherutimStore(s => s.items);
  const favoriteIds = useSherutimStore(s => s.favoriteIds);
  const fetchOnce = useSherutimStore(s => s.fetchOnce);

  // מפעיל fetch פעם אחת; אידמפוטנטי — בטוח גם כששני התצוגות (Preview/Full)
  // עולות יחד, כי ה-store מאחד את הבקשה.
  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  // הפריטים מגיעים ברשימה אחת מעורבת — מפרידים לפי type:
  // 'self' = קטגוריה, 'object' = שירות רגיל.
  const categoryList = useMemo(
    () => items.filter((i): i is SherutCategory => i.type === 'self'),
    [items],
  );

  const withFavorite = useMemo<SherutWithFavorite[]>(
    () => items
      .filter((i): i is Sherut => i.type === 'object')
      .map(s => ({ ...s, isFavorite: favoriteIdSet.has(s.id) })),
    [items, favoriteIdSet],
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
