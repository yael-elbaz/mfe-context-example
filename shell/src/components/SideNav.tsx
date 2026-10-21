import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  to: string;
  /** קידומות נתיב שבהן הפריט מסומן כפעיל */
  matches: string[];
}

const ITEMS: NavItem[] = [
  { label: 'בית', to: '/', matches: [] },
  { label: 'תיקים', to: '/select-employee', matches: ['/employee-portfolio', '/customer-portfolio', '/select-employee'] },
  { label: 'דוחות', to: '/', matches: ['/reports'] },
];

const isActive = (item: NavItem, pathname: string) =>
  item.to === '/' && item.matches.length === 0
    ? pathname === '/'
    : item.matches.some((m) => pathname.startsWith(m));

const MenuIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
    <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** התפריט הכללי של המערכת — עמודה צרה בצד ימין (RTL). */
const SideNav: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      dir="rtl"
      aria-label="תפריט ראשי"
      className="flex w-[160px] shrink-0 flex-col gap-1 self-stretch rounded-xl border border-gray-2 bg-white p-3"
    >
      <div className="mb-2 flex items-center gap-2 px-3 py-1 text-base font-medium text-navy">
        <MenuIcon />
        תפריט
      </div>
      {ITEMS.map((item) => {
        const active = isActive(item, pathname);
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.to)}
            aria-current={active ? 'page' : undefined}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-right text-base ${
              active ? 'bg-header-bg font-medium text-blue-heading' : 'text-navy hover:bg-surface'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

export default SideNav;
