import { useEffect, useMemo, useState } from 'react';
import type { Sherut, SherutCategory } from '../types';
import { SHERUTIM_ITEMS } from '../mockData';
import { getFavoriteSherutim } from '../services/favoriteService';

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
  // האם רשימת המועדפים עדיין נטענת
  loading: boolean;
}

/**
 * בונה מפה של קטגוריות -> שירותים, כאשר לכל שירות מצורף isFavorite,
 * ובנוסף מחזיר את רשימת המועדפים בנפרד.
 */
export function useSherutim(): UseSherutimResult {
  const [favorites, setFavorites] = useState<Sherut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFavoriteSherutim().then(items => {
      if (cancelled) return;
      setFavorites(items);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const favoriteIds = useMemo(() => new Set(favorites.map(f => f.id)), [favorites]);

  // הפריטים מגיעים ברשימה אחת מעורבת — מפרידים לפי type:
  // 'self' = קטגוריה, 'object' = שירות רגיל.
  const categoryList = useMemo(
    () => SHERUTIM_ITEMS.filter((i): i is SherutCategory => i.type === 'self'),
    [],
  );

  const withFavorite = useMemo<SherutWithFavorite[]>(
    () => SHERUTIM_ITEMS
      .filter((i): i is Sherut => i.type === 'object')
      .map(s => ({ ...s, isFavorite: favoriteIds.has(s.id) })),
    [favoriteIds],
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

  return { categories, sherutim: withFavorite, favorites: favoriteList, loading };
}
