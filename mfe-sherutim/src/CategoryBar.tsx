import React, { useEffect, useRef, useState } from 'react';
import type { CategoryWithSherutim, SherutWithFavorite } from './hooks/useSherutim';

// מזהה הטאב "מועדפים" — אין לו קטגוריה אמיתית, ולכן מיוצג בערך קבוע נפרד
export const FAVORITES_ID = 'favorites';

/* ===================== אייקונים (inline SVG מה-Figma) ===================== */

// כוכב — משמש גם ב-pill "מועדפים" וגם בכרטיסי השירות, ולכן מיוצא לשימוש חוזר
export const IconStar: React.FC<{ filled?: boolean; className?: string }> = ({ filled, className }) => (
  <svg viewBox="0 0 22 21" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {filled
      ? <path d="M10.7952 15.7853L4.08359 20.6326L6.72918 12.7491L-0.000220925 7.88405H8.23842L10.7952 0.000531316L13.3521 7.88405H21.5907L14.8613 12.7491L17.5069 20.6326L10.7952 15.7853Z" fill="currentColor" />
      : <path d="M10.7952 15.7853L4.08359 20.6326L6.72918 12.7491L-0.000220925 7.88405H8.23842L10.7952 0.000531316L13.3521 7.88405H21.5907L14.8613 12.7491L17.5069 20.6326L10.7952 15.7853ZM10.7952 13.5836L14.0623 15.9451L12.7661 12.0744L16.1042 9.65962H12.0736L10.7952 5.75337L9.53458 9.65962H5.48628L8.82435 12.0744L7.52819 15.9451L10.7952 13.5836Z" fill="currentColor" />
    }
  </svg>
);

const IconChevron: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8l4 4 4-4" />
  </svg>
);

/* ===================== Pill (כפתור קטגוריה) ===================== */

const CategoryPill: React.FC<{
  label: string;
  count: number;        // מספר השירותים בקטגוריה
  active: boolean;
  dimmed: boolean;
  onClick: () => void;
  iconUrl?: string;     // אייקון הקטגוריה (מגיע מאובייקט ה-self)
  isFavorite?: boolean; // לטאב "מועדפים" אין קטגוריה — מציגים כוכב
  fluid?: boolean;      // רוחב אוטומטי לפי התוכן (לפאנל המובייל) במקום רוחב קבוע
}> = ({ label, count, active, dimmed, onClick, iconUrl, isFavorite, fluid }) => (
  <button
    onClick={onClick}
    className={[
      'flex items-center justify-center gap-1.5 h-[42px] px-3 rounded-[32px] whitespace-nowrap shrink-0',
      fluid ? 'w-auto' : 'w-[176px]',
      'text-[15px] transition-colors',
      active
        ? 'bg-[#2B7FFF] border border-[#2B7FFF] text-white'
        : 'bg-white border border-[#A0AEC0] text-[#00033D] hover:border-[#2B7FFF]',
      dimmed ? 'opacity-50' : 'opacity-100',
    ].join(' ')}
  >
    <span className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-[#F0F6FD] text-[#00033D] shrink-0">
      {isFavorite
        ? <IconStar filled className="w-[15px] h-[15px]" />
        : <img src={iconUrl} alt="" className="w-[15px] h-[15px]" />}
    </span>
    <span>{label}</span>
    <span className={active ? 'text-white/75' : 'text-[#8E929F]'}>({count})</span>
  </button>
);

/* ===================== CategoryBar (שורת הקטגוריות) ===================== */

interface CategoryBarProps {
  categories: CategoryWithSherutim[];
  favorites: SherutWithFavorite[];
  selectedCategoryId: string;
  isSearching: boolean;
  onSelect: (id: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  favorites,
  selectedCategoryId,
  isSearching,
  onSelect,
}) => {
  // תצוגת הדסקטופ (≥1024px): כברירת מחדל שורה אחת; אם יש גלישה ליותר משורה — מציגים כפתור להרחבה
  const pillsRef = useRef<HTMLDivElement>(null);
  const [pillsExpanded, setPillsExpanded] = useState(false);
  const [pillsOverflow, setPillsOverflow] = useState(false);

  useEffect(() => {
    const el = pillsRef.current;
    if (!el) return;
    const check = () => setPillsOverflow(el.scrollHeight > 50); // שורה אחת ≈ 41px
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [categories.length]);

  // תצוגת הטאבלט/מובייל (<1024px): שורה אחת שגוללת אופקית, עם חיצי גלילה בקצוות
  // במקום כפתור "עוד קטגוריות"
  const tabletPillsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = tabletPillsRef.current;
    if (!el) return;
    const check = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanScrollRight(el.scrollLeft < -1);
      setCanScrollLeft(el.scrollLeft > -maxScroll + 1);
    };
    check();
    el.addEventListener('scroll', check);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, [categories.length]);

  const scrollTabletPills = (direction: 'start' | 'end') => {
    const el = tabletPillsRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8 * (direction === 'end' ? -1 : 1);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // תצוגת המובייל (<640px): כפתור בודד מתחת לחיפוש שפותח פאנל עם כל הקטגוריות
  const [mobileOpen, setMobileOpen] = useState(false);

  // מספר השירותים בקטגוריה הנבחרת — מוצג בכפתור המובייל לצד התווית הקבועה
  const selectedCount = isSearching
    ? 0
    : selectedCategoryId === FAVORITES_ID
      ? favorites.length
      : categories.find(c => c.category.id === selectedCategoryId)?.sherutim.length ?? 0;

  // רשימת ה-pills (מועדפים + קטגוריות) — משותפת לכל התצוגות.
  // fluid=true נותן רוחב אוטומטי (לפאנל המובייל); onPick נסגר את הפאנל אחרי בחירה.
  const renderCategoryPills = (fluid = false, onPick?: () => void) => [
    <CategoryPill
      key={FAVORITES_ID}
      label="מועדפים"
      count={favorites.length}
      isFavorite
      fluid={fluid}
      active={!isSearching && selectedCategoryId === FAVORITES_ID}
      dimmed={isSearching}
      onClick={() => { onSelect(FAVORITES_ID); onPick?.(); }}
    />,
    ...categories.map(({ category, sherutim }) => (
      <CategoryPill
        key={category.id}
        label={category.title}
        count={sherutim.length}
        iconUrl={category.iconUrl}
        fluid={fluid}
        active={!isSearching && selectedCategoryId === category.id}
        dimmed={isSearching}
        onClick={() => { onSelect(category.id); onPick?.(); }}
      />
    )),
  ];

  const categoryPills = renderCategoryPills();

  return (
    <>
      {/* שורת קטגוריות — דסקטופ (≥1024px): שורה אחת כברירת מחדל, כפתור פותח שורות נוספות */}
      <div className="hidden lg:flex items-start gap-[12px]">
        <div
          ref={pillsRef}
          className="flex flex-wrap gap-x-[17px] gap-y-[12px] flex-1 overflow-hidden transition-[max-height] duration-300"
          style={{ maxHeight: pillsExpanded ? 500 : 42 }}
        >
          {categoryPills}
        </div>
        {pillsOverflow && (
          <button
            onClick={() => setPillsExpanded(v => !v)}
            aria-label={pillsExpanded ? 'הצג פחות' : 'עוד קטגוריות'}
            className="shrink-0 flex items-center justify-center gap-1.5 h-[42px] px-4 rounded-full whitespace-nowrap text-[15px] bg-white border border-[#A0AEC0] text-[#00033D] hover:border-[#2B7FFF] transition-colors"
          >
            <span>{pillsExpanded ? 'הצג פחות' : 'עוד קטגוריות'}</span>
            <IconChevron className={'w-5 h-5 transition-transform duration-300 ' + (pillsExpanded ? 'rotate-180' : '')} />
          </button>
        )}
      </div>

      {/* שורת קטגוריות — טאבלט (640px–1024px): שורה אחת שגוללת אופקית, עם חיצי גלילה בקצוות.
          הקונטיינר הוא dir="rtl", ולכן ב-flex הילד הראשון ב-DOM מוצג מימין והאחרון משמאל —
          חץ ה"המשך גלילה שמאלה" חייב להיות אחרון ב-DOM כדי שיוצג בצד שמאל, ולהפך. */}
      <div className="hidden sm:flex lg:hidden items-center gap-2">
        {canScrollRight && (
          <button
            onClick={() => scrollTabletPills('start')}
            aria-label="גלול חזרה"
            className="shrink-0 flex items-center justify-center w-9 h-9 text-[#00033D] hover:text-[#2B7FFF] transition-colors"
          >
            <IconChevron className="w-5 h-5 -rotate-90" />
          </button>
        )}
        <div
          ref={tabletPillsRef}
          className="flex flex-nowrap gap-x-[12px] overflow-x-auto no-scrollbar scroll-smooth flex-1"
        >
          {categoryPills}
        </div>
        {canScrollLeft && (
          <button
            onClick={() => scrollTabletPills('end')}
            aria-label="גלול לעוד קטגוריות"
            className="shrink-0 flex items-center justify-center w-9 h-9 text-[#00033D] hover:text-[#2B7FFF] transition-colors"
          >
            <IconChevron className="w-5 h-5 rotate-90" />
          </button>
        )}
      </div>

      {/* שורת קטגוריות — מובייל (<640px): כפתור בודד מתחת לחיפוש שפותח פאנל צף
          עם כל הקטגוריות. הקונטיינר relative כדי שהפאנל (absolute) יופיע מתחתיו
          ויכסה את ראש רשימת השירותים. */}
      <div className="flex sm:hidden relative">
        <button
          onClick={() => setMobileOpen(v => !v)}
          aria-expanded={mobileOpen}
          className="w-full flex items-center justify-center gap-1.5 h-[47px] px-4 rounded-lg bg-[#DCE9FF] border border-[#2B7FFF] text-[#00033D] text-[15px] font-medium transition-colors"
        >
          <span>לכל התחומים</span>
          <span className="text-[#5B6B8C]">({selectedCount})</span>
          <IconChevron className={'w-5 h-5 transition-transform duration-300 ' + (mobileOpen ? 'rotate-180' : '')} />
        </button>

        {mobileOpen && (
          <>
            {/* שכבת לחיצה-מחוץ לסגירת הפאנל */}
            <div className="fixed inset-0 z-30" onClick={() => setMobileOpen(false)} />
            <div className="absolute top-full inset-x-0 mt-2 z-40 bg-white rounded-2xl shadow-[0_8px_24px_rgba(6,77,173,0.18)] p-4 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-wrap gap-2 justify-center">
                {renderCategoryPills(true, () => setMobileOpen(false))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CategoryBar;
