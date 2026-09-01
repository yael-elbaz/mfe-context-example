import React from 'react';
import { UserDetails } from './UserDetails';
import iconCalendar from '../assets/icons/header-calendar.svg';
import iconNotification from '../assets/icons/header-notification.svg';
import iconSearch from '../assets/icons/header-search.svg';

/**
 * שדה החיפוש בהדר — Figma 7:2736.
 * 288px, רקע Gray_3, מסגרת Gray_2, פינות 8, ריפוד 16/12.
 */
const SearchField: React.FC = () => (
  <div className="flex w-[288px] shrink-0 items-center justify-end gap-2 rounded-lg border border-solid border-field-border bg-field-bg px-4 py-3">
    <input
      type="text"
      placeholder="חיפוש כללי"
      dir="rtl"
      aria-label="חיפוש כללי"
      className="min-w-px flex-1 bg-transparent text-right text-[16px] leading-[1.25] font-normal text-navy outline-none placeholder:text-gray-placeholder"
    />
    <img src={iconSearch} alt="" className="size-6 shrink-0" />
  </div>
);

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
