import React, { useState, useRef, useEffect } from 'react';
import { useUser, useSelectedUnit } from '../store/appContext';
import { UserPopup } from './UserPopup';
import iconArrowDown from '../assets/icons/header-arrow-down.svg';

/**
 * בלוק המשתמש בהדר — Figma 239:12218 ("Drop down").
 *
 * מידות מהעיצוב: גובה 56, ריפוד 12, פינות 8, מרווח 24 בין החץ לשאר.
 * הסדר (משמאל לימין): חץ · מיקום · קו 19px · שם · אווטאר 40px.
 *
 * מתחת ל-md (Figma 17:12467, מסגרת "Tablet_2"): המיקום והקו 19px נעלמים
 * ונשארים חץ · שם · אווטאר. אין אובדן פונקציונליות — היחידה עדיין נבחרת
 * מתוך UserPopup שנפתח מהחץ.
 *
 * מתחת ל-sm (Figma 17:12090, מסגרת "Mobile_1"): נעלמים גם השם וגם החץ, ונשאר
 * האווטאר בלבד — והוא זה שפותח את הפופאפ.
 *
 * מוסתרת כאן **כל הקבוצה** (השם + המיקום + הקו) ולא רק השם: קבוצה ריקה עדיין
 * נספרת כפריט flex, וה-gap-[11px] שבינה לבין האווטאר היה משאיר 11px רווח רפאים
 * משמאלו. display:none על הקבוצה מוציא אותה מהפריסה וה-gap נסגר מעצמו.
 *
 * הרוחב **לא** קבוע על 376px כמו בעיצוב: שם הטקסט הוא ג'יבריש ארוך שממלא את
 * הרוחב, ועם נתונים אמיתיים (שמות קצרים) justify-end היה משאיר רווח ריק
 * בצד שמאל של ההדר. הבלוק נצמד לתוכן שלו.
 *
 * שים לב שהאווטאר בעיצוב הוא **ריבוע מעוגל** (rounded 4px, מסגרת נייבי)
 * ולא עיגול.
 */
const Avatar: React.FC<{ image?: string; name?: string }> = ({ image, name }) => (
  <div className="relative size-[40px] shrink-0">
    {image ? (
      <img
        src={image}
        alt={name ?? 'משתמש'}
        className="absolute inset-[2.5%] rounded-[4px] border border-solid border-navy object-cover"
      />
    ) : (
      <div className="absolute inset-[2.5%] rounded-[4px] border border-solid border-navy" />
    )}
  </div>
);

export const UserDetails: React.FC = () => {
  const user = useUser();
  const selectedUnit = useSelectedUnit();
  const [popupOpen, setPopupOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex h-[56px] shrink-0 items-center gap-6 rounded-lg p-3"
    >
      <button
        onClick={() => setPopupOpen((prev) => !prev)}
        className="hidden size-6 shrink-0 cursor-pointer items-center justify-center sm:flex"
        aria-label="פתח תפריט יחידה"
        aria-expanded={popupOpen}
      >
        <img src={iconArrowDown} alt="" className="size-full" />
      </button>

      <div className="flex shrink-0 items-center gap-[11px]">
        <div className="hidden shrink-0 items-center gap-[11px] sm:flex">
          <span
            dir="auto"
            className="hidden max-w-[150px] truncate text-[16px] leading-[1.25] font-normal text-navy md:block"
          >
            {selectedUnit?.name ?? 'לא נבחרה יחידה'}
          </span>
          <span aria-hidden className="hidden h-[19px] w-px shrink-0 bg-black md:block" />
          <span dir="auto" className="text-[16px] leading-[1.25] font-normal whitespace-nowrap text-navy">
            {user?.name ?? 'ישראל ישראלי'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setPopupOpen((prev) => !prev)}
          className="flex shrink-0 cursor-pointer items-center"
          aria-label="פתח תפריט משתמש"
          aria-expanded={popupOpen}
        >
          <Avatar image={user?.image} name={user?.name} />
        </button>
      </div>

      {popupOpen && (
        <div dir="rtl" className="absolute top-[calc(100%+4px)] right-0 z-50">
          <UserPopup onClose={() => setPopupOpen(false)} />
        </div>
      )}
    </div>
  );
};
