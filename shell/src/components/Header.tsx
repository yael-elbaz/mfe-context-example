import React from 'react';
import calendarIcon from '../assets/icons/calendar.svg';
import notificationIcon from '../assets/icons/notification.svg';
import searchIcon from '../assets/icons/search.svg';

// ── אייקונים מיוצאים מפיגמה (Icon Header, 24×24) ─────────────────

const HeaderIcon: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="shrink-0 size-6 overflow-clip">
    <img src={src} alt={alt} className="block size-full max-w-none" />
  </div>
);

// ── שדה חיפוש (Search Field / Deafult) ───────────────────────────

const SearchField: React.FC = () => (
  <div className="flex w-72 shrink-0 items-center justify-end gap-2 rounded-lg border border-gray-2 bg-gray-3 px-4 py-3">
    <span dir="rtl" className="min-w-px flex-1 text-right text-base leading-tight text-gray-1">
      חיפוש כללי
    </span>
    <HeaderIcon src={searchIcon} alt="" />
  </div>
);

// ── Top Bar ──────────────────────────────────────────────────────
// dir="ltr" כדי לשמור על סדר האלמנטים כפי שהוא בפיגמה:
// קבוצת האייקונים משמאל, הלוגו מימין. הטקסט העברי עצמו RTL.

export const Header: React.FC = () => {
  return (
    <header
      dir="ltr"
      className="fixed inset-x-0 top-0 z-[100] box-border flex h-20 items-center justify-between bg-white px-10 py-4"
      style={{ boxShadow: '0px 3px 0.6px 14px #00000005' }}
    >
      <div className="flex h-full items-center gap-4">
        {/* Line 923 — קו מפריד אנכי */}
        <div className="h-12 w-px shrink-0 bg-gray-1" />

        <div className="flex shrink-0 items-center gap-[15px]">
          <HeaderIcon src={calendarIcon} alt="לוח שנה" />
          <HeaderIcon src={notificationIcon} alt="התראות" />
        </div>

        <SearchField />
      </div>

      {/* image 9 — לוגו */}
      <div className="h-12 w-[50px] shrink-0 rounded-[7px] bg-gray-3" />
    </header>
  );
};
