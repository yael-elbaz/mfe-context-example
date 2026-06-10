import React from 'react';
import { UserDetails } from './UserDetails';

// ── אייקונים inline SVG ──────────────────────────────────────────

const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#1C2B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#1C2B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#1C2B5E" strokeWidth="1.5" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="#1C2B5E" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="#00033D" strokeWidth="1.5" />
    <path d="M16.5 16.5L21 21" stroke="#00033D" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="#1C2B5E" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ── Header ───────────────────────────────────────────────────────

export const Header: React.FC = () => {
  return (
    <header
      className="flex items-center justify-between lg:justify-end bg-white h-11 md:h-[66px]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100vw',
        padding: '16px',
        boxShadow: '0px 3px 5.9px 14px #00000040',
        zIndex: 100,
        direction: 'rtl',
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* לוגו + המבורגר — מוצגים רק על tablet/mobile, צמודים יחד */}
      <div className="lg:hidden flex items-center gap-2">
        <button className="flex items-center justify-center" aria-label="תפריט">
          <HamburgerIcon />
        </button>
        <div
          className="flex-shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden w-7 h-[27px] md:w-[52px] md:h-[50px]"
          style={{ borderRadius: '7px' }}
        >
          <span className="text-xs text-gray-400">לוגו</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* בר חיפוש מלא — desktop/laptop בלבד */}
        <div
          className="hidden lg:flex items-center flex-row-reverse gap-2 bg-search-bg"
          style={{
            width: '245px',
            height: '38px',
            borderRadius: '38px',
            paddingInlineStart: '20px',
            paddingInlineEnd: '16px',
          }}
        >
          <span
            className="flex-1 text-right bg-transparent outline-none text-sm text-navy opacity-40"
            style={{ fontFamily: 'Rubik' }}
          >
            חיפוש כללי
          </span>
          <SearchIcon />
        </div>

        {/* אייקון חיפוש בודד — tablet/mobile בלבד */}
        <button className="lg:hidden flex items-center justify-center" aria-label="חיפוש">
          <SearchIcon />
        </button>

        {/* איקונים: לוח שנה + פעמון — מוסתר על mobile */}
        <div className="hidden md:flex items-center" style={{ gap: '13px' }}>
          <CalendarIcon />
          <BellIcon />
        </div>

        {/* קו מפריד אנכי */}
        <div style={{ width: '1px', height: '32px', background: '#E0E0E0' }} />

        {/* פרטי משתמש + פופאפ */}
        <UserDetails />
      </div>
    </header>
  );
};
