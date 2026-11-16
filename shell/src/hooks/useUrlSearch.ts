import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

/** החיפוש החופשי של האובייקטים הדיגיטליים — פרמטר רגיל ב-URL (לא בתוך q) */
export const DO_SEARCH_PARAM = 'doSearch';

/**
 * חיפוש חופשי שנשמר ב-URL, כדי שיעבור יחד עם הניווט: Preview → אוברליי מעל digital-objects,
 * "הצג הכל", "חזרה", סגירת האוברליי (Helper.buildQParam מעתיק את הפרמטרים הרגילים הלאה).
 * - replace — הקלדה לא מוסיפה רשומות להיסטוריה.
 * - state נשמר — אחרת הקלדה בזמן שאוברליי פתוח מוחקת את ה-mfeConfig מה-state והשירות נטען מחדש.
 */
export function useUrlSearch(key: string = DO_SEARCH_PARAM) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const value = searchParams.get(key) ?? '';

  const onChange = useCallback((next: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next) p.set(key, next);
      else p.delete(key);
      return p;
    }, { replace: true, state: location.state });
  }, [key, setSearchParams, location.state]);

  return { search: value, onSearchChange: onChange };
}

/**
 * מנקה את החיפוש מה-URL כשמחליפים אדם בתיק (לא ב-mount הראשון — אז הוא הגיע מקישור / רענון).
 * ניווט מדף הבית / בורר העובד בונה URL חדש ממילא; זה מכסה החלפה שמשאירה את שאר ה-URL.
 */
export function useClearUrlSearchOnChange(personId: string, key: string = DO_SEARCH_PARAM) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const prev = useRef(personId);

  useEffect(() => {
    if (prev.current === personId) return;
    prev.current = personId;
    if (!searchParams.has(key)) return;
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next, { replace: true, state: location.state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId]);
}
