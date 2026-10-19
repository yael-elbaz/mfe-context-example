import { useEffect, useMemo } from 'react';
import { OBJECT_TYPE_CODE, type PersonType, type Sherut, type SherutCategory, type SherutWithFavorite } from '../types';
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

// האם השירות רלוונטי לסוג האדם — לפי כל ערכי objectType שב-menuParamsList (המפתח יכול לחזור כמה פעמים)
function matchesObjectType(sherut: Sherut, objectType: PersonType): boolean {
  const code = OBJECT_TYPE_CODE[objectType];
  return sherut.menuParamsList.some(p => p.parameterKey === 'objectType' && p.parameterValue === code);
}

/**
 * קורא את השירותים מתוך ה-store המשותף (fetch פעם אחת לכל הסשן) עבור היחידה הנבחרת.
 * ה-isFavorite כבר צרוב על כל שירות ב-store; כאן רק מפרידים לקטגוריות/שירותים/מועדפים.
 * objectType — סוג האדם הנבחר שה-shell שולח. כשהוא קיים מוצגים רק שירותים שרלוונטיים לו
 * (וקטגוריות שנשארו ריקות מוסתרות); כש-objectType הוא null/undefined (למשל דף הבית) מוחזרים כל השירותים ללא סינון.
 */
export function useSherutim(objectType?: PersonType | null): UseSherutimResult {
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
    () => items.filter((i): i is SherutWithFavorite =>
      i.type === 'object' && (!objectType || matchesObjectType(i, objectType))
    ),
    [items, objectType],
  );

  const categories = useMemo<CategoryWithSherutim[]>(
    () => {
      const all = categoryList.map(category => ({
        category,
        sherutim: withFavorite.filter(s => s.idntObjectAv === category.idntObject),
      }));
      return objectType ? all.filter(c => c.sherutim.length > 0) : all;
    },
    [categoryList, withFavorite, objectType],
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
