import React, { useEffect, useRef, useState } from 'react';
import { UserDetails } from './UserDetails';
import iconCalendar from '../assets/icons/header-calendar.svg';
import iconNotification from '../assets/icons/header-notification.svg';
import iconSearch from '../assets/icons/header-search.svg';

/**
 * שדה החיפוש בהדר — Figma 7:2736 (דסקטופ), 7:2745 מצב "Close" (טאבלט/מובייל).
 * 288px, רקע Gray_3, מסגרת Gray_2, פינות 8, ריפוד 16/12.
 *
 * מ-md ומעלה: השדה מוצג כרגיל בתוך הזרימה, במראה inline (רקע Gray_3, בלי צל).
 *
 * מתחת ל-md: רק אייקון 24px, ולחיצה פותחת את השדה כ**פופאפ צף** מעל תוכן ההדר —
 * רקע לבן, פינות מעוגלות, מסגרת וצל, כדי שייקרא כשכבה שמרחפת ולא כשדה שהחליף
 * את מה שהיה שם. ההדר לא זז ולא משנה גובה.
 *
 * הפופאפ נפתח **ימינה** (left-0) לכיוון הלוגו ולא שמאלה. הסיבה מדידה: אייקון
 * החיפוש יושב סביב x=328, והאווטאר נגמר ב-x=181 — פופאפ 288px שמוצמד ימינה
 * (right-0) התחיל ב-x=64 ובלע את השם, האווטאר, הקו, הלוח־שנה והפעמון. פתיחה
 * ימינה משאירה את כל בלוק המשתמש גלוי; המחיר הוא כיסוי הלוגו מתחת ל-~640px.
 *
 * הכיוון **קבוע** ולעולם לא מתהפך. הייתה כאן גרסה עם היפוך אוטומטי ל-right-0
 * כשנגמר המקום מימין, והיא נפסלה: בהקטנת החלון הפופאפ קפץ פתאום לצד שמאל של
 * ההדר וזה נראה שבור. במקום זה רק הרוחב מצטמצם.
 *
 * הכתיבה mobile-first: מחלקות הבסיס הן מראה הפופאפ, וה-md: מחזירות את המראה
 * ה-inline (md:bg-field-bg, md:shadow-none, md:static).
 *
 * ה-maxWidth נמדד ב-JS ולא נכתב כמחלקה קבועה: המיקום האופקי של האייקון תלוי
 * באורך שם המשתמש, ולכן calc קבוע כמו calc(100vw-352px) היה נשבר עם שם ארוך
 * והפופאפ היה חורג מהמסך. נמדד רק מתחת ל-md; מ-md ומעלה הערך undefined ולכן
 * React לא כותב style בכלל ו-w-[288px] חוזר לשלוט.
 *
 * ה-ref עוטף גם את הכפתור וגם את השדה: אחרת הקליק שפותח היה נספר מיד גם
 * כ"קליק בחוץ" והשדה היה נסגר באותו רגע.
 */
const SearchField: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [popupMaxWidth, setPopupMaxWidth] = useState<number | undefined>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // הפופאפ נפתח תמיד ימינה מהאייקון ולעולם לא מתהפך לצד השני — היפוך אוטומטי
    // נוסה ונפסל, כי בהקטנת החלון הוא קפץ פתאום לצד שמאל של ההדר.
    // מה שכן משתנה הוא הרוחב: הוא נחתך למקום שנשאר מימין לאייקון עד קצה המסך,
    // אחרת הפופאפ היה חורג מהמסך ויוצר גלילה אופקית לכל הדף.
    const measure = () => {
      if (window.matchMedia('(min-width: 48rem)').matches) {
        setPopupMaxWidth(undefined);
        return;
      }
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPopupMaxWidth(Math.round(window.innerWidth - rect.left - 16));
    };

    measure();
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', measure);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', measure);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="פתח חיפוש כללי"
        aria-expanded={open}
        className="flex size-6 shrink-0 cursor-pointer items-center justify-center md:hidden"
      >
        <img src={iconSearch} alt="" className="size-full" />
      </button>

      <div
        style={{ maxWidth: popupMaxWidth }}
        className={`${
          open ? 'absolute top-1/2 left-0 z-10 flex -translate-y-1/2' : 'hidden'
        } w-[288px] shrink-0 items-center justify-end gap-2 rounded-lg border border-solid border-field-border bg-white px-4 py-3 shadow-lg md:static md:z-auto md:flex md:translate-y-0 md:bg-field-bg md:shadow-none`}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="חיפוש כללי"
          dir="rtl"
          aria-label="חיפוש כללי"
          className="min-w-px flex-1 bg-transparent text-right text-[16px] leading-[1.25] font-normal text-navy outline-none placeholder:text-gray-placeholder"
        />
        <img src={iconSearch} alt="" className="size-6 shrink-0" />
      </div>
    </div>
  );
};

/**
 * ההדר — Figma 239:12058.
 *
 * הפריסה מוגדרת ב-dir="ltr" בכוונה: מסגרת העיצוב בפיגמה בנויה משמאל לימין,
 * וכך סדר ה-DOM כאן זהה לסדר בעיצוב ואין צורך להפוך כל קבוצה מקוננת.
 * הטקסטים עצמם מקבלים dir משלהם ולכן נשארים עברית תקינה.
 *
 * הסדר (משמאל לימין): בלוק המשתמש · קו מפריד · לוח שנה · פעמון · חיפוש ... לוגו.
 *
 * גובה 80px — חייב להישאר זהה ל---header-height ב-index.css, שלפיו HomePage
 * מזיזה את התוכן למטה. פער בין השניים מסתיר תוכן מתחת להדר הקבוע.
 *
 * כדי להיכנס ל-80px ה-Top Bar מקבל py-2 במקום py-4 שבעיצוב: 8+8 ריפוד ההדר
 * משאירים 64px, ושדה החיפוש (44px) עם py-4 היה מגיע ל-76px וחורג.
 */
export const Header: React.FC = () => (
  <header
    dir="ltr"
    className="fixed inset-x-0 top-0 z-[100] flex h-[80px] items-center bg-header-bg px-6 py-2"
  >
    <UserDetails />

    {/* Top Bar — Figma 239:13276 */}
    <div className="flex min-w-px flex-1 items-center justify-between px-10 py-2 drop-shadow-[0px_3px_0.3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4 self-stretch">
        <span aria-hidden className="w-px shrink-0 self-stretch bg-gray-placeholder" />

        <div className="flex shrink-0 items-center gap-[15px]">
          <button className="flex size-6 cursor-pointer items-center justify-center" aria-label="לוח שנה">
            <img src={iconCalendar} alt="" className="size-full" />
          </button>
          <button className="flex size-6 cursor-pointer items-center justify-center" aria-label="התראות">
            <img src={iconNotification} alt="" className="size-full" />
          </button>
        </div>

        <SearchField />
      </div>

      {/* לוגו — Figma 50×48, פינות 7 */}
      <div className="h-[48px] w-[50px] shrink-0 rounded-[7px] bg-white/50" />
    </div>
  </header>
);
