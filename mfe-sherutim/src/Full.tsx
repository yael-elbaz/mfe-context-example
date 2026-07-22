import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import type { OpenService, SherutCategory } from './types';
import { useSherutim } from './hooks/useSherutim';
import { useSherutimStore } from './store/sherutimStore';
import ErrorBoundary from './ErrorBoundary';
import CategoryBar, { FAVORITES_ID, IconStar } from './CategoryBar';

interface Props {
  openService?: OpenService;
  employeeId?: string;
  navigate?: (to: string) => void;
}

function param(key: string, value: string) {
  return { codeSugParameter: '', parameterKey: key, parameterValue: value };
}

function makeCall(params: Record<string, string>, url?: string) {
  return {
    codeSugObject: 0, textMenuItem: '', kamutknisot: 0, isFavorite: false,
    logiPnimi: false, openInIe: false, logiSugObjectMismach: false,
    categoryId: '', idntObject: 0, idntMenuItemAv: 0, idntMenuItem: 0,
    textNativ: '', textMenu: '', textMenuTarget: '', idntMaarechet: 0,
    url,
    menuParamsList: Object.entries(params).map(([k, v]) => param(k, v)),
  };
}

/* ===================== אייקונים (inline SVG מה-Figma) ===================== */

const IconSparkle: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 28 28" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3.5l2.93 5.95 6.57.95-4.75 4.63 1.12 6.54L14 23.5l-5.87 3.09 1.12-6.54-4.75-4.63 6.57-.95L14 3.5z" />
  </svg>
);

const IconSearch: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="6" />
    <path d="M17 17l-3.5-3.5" />
  </svg>
);

/* ===================== כותרת עם tooltip רק בגלישה ===================== */
// ה-tooltip (title) מוצג רק כאשר הטקסט באמת נחתך (יש "שלוש נקודות"),
// כלומר כשרוחב התוכן גדול מהרוחב הזמין.
const CardTitle: React.FC<{ title: string }> = ({ title }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setTruncated(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [title]);

  return (
    <div className="group relative w-full">
      <span
        ref={ref}
        className="block w-full text-[#111138] text-[13px] font-medium text-center leading-snug truncate"
      >
        {title}
      </span>

      {/* tooltip מעוצב — מוצג רק כשהטקסט נחתך, ורק ב-hover */}
      {truncated && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-1/2 translate-x-1/2 mb-2 z-20
                     w-max max-w-[200px] px-3 py-2 rounded-lg
                     bg-[#00033D] text-white text-[12px] leading-snug text-center whitespace-normal
                     shadow-[0_6px_20px_rgba(0,3,61,0.35)]
                     opacity-0 translate-y-1 transition-all duration-150
                     group-hover:opacity-100 group-hover:translate-y-0"
        >
          {title}
          {/* חץ קטן שמצביע כלפי מטה אל הכותרת */}
          <span className="absolute top-full right-1/2 translate-x-1/2 -mt-1 w-2 h-2 rotate-45 bg-[#00033D]" />
        </div>
      )}
    </div>
  );
};

/* ===================== Card (כרטיס שירות) ===================== */

const SherutCard: React.FC<{
  title: string;
  status: string;
  favorite: boolean;
  showIcon: boolean;        // האם לשריין מקום לאייקון (מועדפים/חיפוש) — גם אם אין אייקון בפועל
  categoryIconUrl?: string; // אייקון הקטגוריה של השירות (עשוי להיות חסר)
  fullWidthOnMobile?: boolean; // כשיש שירות יחיד בתצוגה — במובייל הכרטיס נמתח לרוחב מלא
  onClick: () => void;
  onToggleFavorite: () => void;
}> = ({ title, status, favorite, showIcon, categoryIconUrl, fullWidthOnMobile, onClick, onToggleFavorite }) => (
  <button
    onClick={onClick}
    className={`relative ${fullWidthOnMobile ? 'w-full sm:w-[149px]' : 'w-[149px]'} h-[193px] bg-white rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_rgba(6,77,173,0.08),0_1px_2px_rgba(6,77,173,0.06)] flex flex-col items-center justify-center gap-3 px-3 hover:border-[#2B7FFF] transition-colors`}
  >
    {/* הכוכב הוא span אינטראקטיבי (לא button) כדי לא לקנן button בתוך button.
        stopPropagation מונע מהלחיצה להפעיל גם את onClick של הכרטיס (openService). */}
    <span
      role="button"
      aria-label={favorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
      onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
      className={(favorite ? 'text-[#F97316]' : 'text-[#A0AEC0]') + ' absolute top-3 left-3 cursor-pointer hover:scale-110 transition-transform'}
    >
      <IconStar filled={favorite} className="w-[18px] h-[18px]" />
    </span>

    {/* משריינים את משבצת האייקון בכל מצב "אייקון" — כך שהכותרת והסטטוס נשארים באותו מקום
        גם כשלשירות מסוים אין אייקון או שהאייקון נכשל בטעינה */}
    {showIcon && (
      <span className="flex items-center justify-center w-[58px] h-[58px] rounded-2xl bg-[#F0F6FD] shrink-0">
        {categoryIconUrl && (
          <img
            src={categoryIconUrl}
            alt=""
            className="w-[30px] h-[30px]"
            onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
          />
        )}
      </span>
    )}

    <CardTitle title={title} />

    <span className="px-3 py-0.5 rounded-full bg-[#F0F6FD] text-[#2B7FFF] text-[11px] font-medium">
      {status}
    </span>
  </button>
);

/* ===================== Empty state — אין מועדפים ===================== */

const EmptyFavoritesIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="675 158 282 205" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="710.639" y="166.141" width="124.778" height="159.367" rx="3.52587" transform="rotate(7.03264 710.639 166.141)" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="804.068" y1="303.391" x2="847.808" y2="308.786" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="791.214" y1="313.422" x2="875.003" y2="323.758" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M830.35 236.481C830.778 236.86 831.221 237.312 831.668 237.837C832.621 238.955 833.553 240.335 834.415 241.837C836.141 244.848 837.525 248.254 838.188 250.822C838.257 251.088 838.419 251.319 838.645 251.475C846.757 257.052 853.863 266.2 856.888 274.266C857.032 274.649 857.371 274.926 857.776 274.99L877.004 278.021L860.237 323.811L849.587 318.471C849.437 318.395 849.272 318.354 849.104 318.35C814.655 317.543 788.023 312.651 770.002 306.875C760.987 303.985 754.163 300.886 749.6 297.992C747.317 296.544 745.636 295.17 744.533 293.93C743.412 292.67 742.988 291.664 742.964 290.938C742.941 290.189 743.271 289.467 744.405 288.809C745.599 288.115 747.588 287.567 750.59 287.332C751.062 287.295 751.461 286.97 751.593 286.516C751.725 286.061 751.562 285.572 751.183 285.288C750.649 284.887 749.956 284.404 749.216 283.879C748.467 283.347 747.648 282.76 746.828 282.13C745.17 280.858 743.571 279.464 742.534 278.076C741.476 276.662 741.203 275.538 741.567 274.631C741.96 273.653 743.276 272.417 746.704 271.296C747.052 271.182 747.325 270.906 747.435 270.557C747.545 270.207 747.48 269.826 747.26 269.532C746.954 269.124 746.563 268.306 746.251 267.169C745.946 266.054 745.74 264.71 745.749 263.3C745.766 260.47 746.641 257.505 749.146 255.455C749.52 255.149 749.66 254.64 749.495 254.186C748.507 251.471 748.118 248.665 748.169 246.422C748.195 245.299 748.33 244.354 748.534 243.649C748.67 243.178 748.816 242.888 748.929 242.721C759.477 241.982 774.796 242.117 789.631 243.138C804.693 244.174 819.117 246.113 827.525 248.915C827.85 249.023 828.206 248.979 828.495 248.795C828.784 248.611 828.975 248.307 829.014 247.967L830.35 236.481Z" fill="#CCE0F7" stroke="#101C4B" strokeWidth="2.27475" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M880.245 274.904L930.013 280.088L900.982 352.667L860.027 333.486L880.245 274.904Z" fill="#006AFF" />
    <path d="M893.724 286.309C893.065 288.757 892.299 291.573 891.468 294.604M891.468 294.604C888.809 304.303 885.477 316.194 882.782 325.191C882.401 326.463 882.033 327.678 881.681 328.82C880.002 334.271 878.697 338.075 878.171 338.67M891.468 294.604L905.129 296.159M881.681 328.82L892.687 333.486M882.782 325.191L891.468 326.746M930.013 280.088L880.245 274.904L860.027 333.486L900.982 352.667L930.013 280.088Z" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M785.235 292.419C770.966 289.99 738.867 287.066 739.586 276.249C739.83 272.57 742.7 270.63 746.483 269.801M793.744 275.296C781.391 273.982 760.257 272.19 746.483 269.801M746.483 269.801C743.376 266.629 739.533 259.06 749.015 254.159M749.015 254.159C765.305 256.129 792.811 257.669 795.299 257.67L749.015 254.159ZM749.015 254.159C746.69 252.303 743.738 248.989 745.728 244.746C747.52 240.923 752.225 239.789 756.442 239.583L818.553 236.54" stroke="#FBFCFC" strokeWidth="2.04728" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M752.057 286.198C749.81 286.371 740.309 283.466 741.903 293.96C743.497 304.453 804.556 317.932 810.777 318.969" stroke="#FBFCFC" strokeWidth="2.04728" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M872.875 325.728C873.873 325.886 874.779 327.054 874.53 328.627C874.282 330.2 873.061 331.033 872.063 330.875C871.065 330.718 870.159 329.55 870.408 327.977C870.656 326.403 871.877 325.571 872.875 325.728Z" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M806.775 224.092L723.143 214.564" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" />
    <path d="M810.657 241.504L719.26 229.778" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" />
    <path d="M810.657 258.916L719.26 247.19" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" />
    <path d="M799.758 274.857L730.16 264.603" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" />
    <path d="M799.758 290.799L730.16 280.545" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" />
    <path d="M799.758 306.738L730.16 296.484" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" />
    <path d="M799.758 322.68L730.16 312.426" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" />
    <path d="M710.548 173.35C710.983 173.267 711.422 173.475 711.635 173.864L717.173 183.981L728.506 181.841C728.942 181.759 729.381 181.966 729.594 182.355C729.807 182.744 729.745 183.226 729.441 183.549L721.529 191.941L727.067 202.058C727.28 202.447 727.218 202.929 726.914 203.252C726.61 203.575 726.132 203.665 725.732 203.475L715.305 198.545L707.394 206.938C707.09 207.26 706.613 207.35 706.212 207.161C705.811 206.971 705.578 206.545 705.634 206.105L707.101 194.666L696.675 189.735C696.274 189.546 696.04 189.119 696.097 188.68C696.153 188.24 696.487 187.886 696.922 187.804L708.255 185.664L709.723 174.225L709.756 174.064C709.864 173.701 710.166 173.422 710.548 173.35Z" fill="#FF5934" stroke="#101C4B" strokeWidth="2.04728" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmptyFavorites: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center py-10">
    {/* רוחב האיור לפי גודל מסך: בסיס (קטן) → sm → md → lg */}
    <EmptyFavoritesIllustration className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[320px] h-auto mb-6" />
    <h3 className="m-0 text-[#1A1E27] text-[18px] font-semibold">אין לך עדיין שירותים מועדפים</h3>
    <p className="mt-2 mb-0 text-[#4A5568] text-[14px]">סמנו שירות בכוכב כדי להוסיף אותו למועדפים ולמצוא אותו כאן בקלות</p>
  </div>
);

/* ===================== Full ===================== */

const Full: React.FC<Props> = ({ openService, employeeId = '', navigate }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(FAVORITES_ID);
  const [searchQuery, setSearchQuery] = useState('');

  // ה-hook מפריד את הרשימה המעורבת לקטגוריות + שירותים, מצרף isFavorite לכל שירות,
  // ומחזיר את רשימת המועדפים ואת כל השירותים בצורה שטוחה
  const { categories, sherutim, favorites, loading: favoritesLoading } = useSherutim();
  const toggleFavorite = useSherutimStore(s => s.toggleFavorite);

  const trimmedQuery = searchQuery.trim();
  const isSearching = trimmedQuery.length > 0;

  // מיפוי idntObject -> קטגוריה, כדי למצוא את אייקון הקטגוריה של כל שירות
  const categoryByIdnt = useMemo(() => {
    const m = new Map<number, SherutCategory>();
    categories.forEach(({ category }) => m.set(category.idntObject, category));
    return m;
  }, [categories]);

  // גובה העמוד: ממלא בדיוק מהמקום שבו הרכיב מתחיל ועד תחתית ה-viewport,
  // כך שהעמוד עצמו לא גולל — רק הפאנל הלבן גולל בתוכו כשיש הרבה שירותים.
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootHeight, setRootHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const top = el.getBoundingClientRect().top;
      setRootHeight(window.innerHeight - top);
    };
    measure();
    window.addEventListener('resize', measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, []);

  const visibleSherutim = useMemo(() => {
    if (isSearching) {
      return sherutim.filter(s => s.title.includes(trimmedQuery));
    }
    if (selectedCategoryId === FAVORITES_ID) {
      return favorites;
    }
    return categories.find(c => c.category.id === selectedCategoryId)?.sherutim ?? [];
  }, [isSearching, trimmedQuery, selectedCategoryId, favorites, categories, sherutim]);

  const isLoadingFavorites = !isSearching && selectedCategoryId === FAVORITES_ID && favoritesLoading;

  // אייקון הקטגוריה מוצג על הכרטיסים רק בתצוגה מרובת-קטגוריות (מועדפים/חיפוש),
  // אך לא כשבחורה קטגוריה ספציפית
  const showCategoryIconOnCards = isSearching || selectedCategoryId === FAVORITES_ID;

  const selectCategory = (id: string) => {
    setSearchQuery('');
    setSelectedCategoryId(id);
  };

  return (
    <div
      ref={rootRef}
      dir="rtl"
      className="flex flex-col gap-[25px] p-10 rounded-2xl overflow-visible sm:overflow-hidden sm:h-[var(--rh)]"
      style={{
        ['--rh' as string]: rootHeight ? `${rootHeight}px` : undefined,
        background: 'radial-gradient(48.71% 103.18% at 115.76% 75.51%, #C5DFFF 0%, #EDF4FD 100%)',
      } as React.CSSProperties}
    >
      {/* שורה עליונה: חיפוש חופשי + חזרה */}
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <span className="absolute top-1/2 -translate-y-1/2 left-4 text-[#00033D]">
            <IconSearch className="w-6 h-6" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="חפש שירות"
            className="w-full sm:w-[350px] h-[47px] bg-white border border-[#A0AEC0] rounded-lg pl-12 pr-4 text-[15px] text-[#00033D] text-right outline-none placeholder:text-[#8E929F] focus:border-[#2B7FFF]"
          />
        </div>
        <button
          onClick={() => navigate?.(employeeId ? `/employee-portfolio?employeeId=${employeeId}` : '/')}
          className="h-[41px] px-5 rounded-full bg-white border border-[#A0AEC0] text-[#00033D] text-[14px] hover:border-[#2B7FFF] transition-colors"
        >
          ← חזרה
        </button>
      </div>

      {/* שורת הקטגוריות — כל הלוגיקה והתצוגה (דסקטופ + טאבלט) מרוכזת ברכיב CategoryBar */}
      <CategoryBar
        categories={categories}
        favorites={favorites}
        selectedCategoryId={selectedCategoryId}
        isSearching={isSearching}
        onSelect={selectCategory}
      />

      {/* פאנל לבן — עמודת flex עם אזור כרטיסים שגולל בפנים */}
      <div className="bg-white rounded-2xl shadow-[0_2px_6px_rgba(6,77,173,0.08)] p-8 flex flex-col sm:flex-1 sm:min-h-0">
        {/* כותרת */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F0F6FD] text-[#2B7FFF]">
            <IconSparkle className="w-7 h-7" />
          </span>
          <h2 className="m-0 text-[#00033D] text-[20px] font-semibold">שירותים דיגיטליים</h2>
        </div>

        {/* כרטיסים — אזור גלילה פנימי כשיש הרבה שירותים */}
        <div className="sm:flex-1 sm:min-h-0 sm:overflow-y-auto -mr-2 pr-2">
          {isLoadingFavorites ? (
            <div className="text-[#848282] text-[14px]">⏳ טוען מועדפים...</div>
          ) : visibleSherutim.length === 0 ? (
            !isSearching && selectedCategoryId === FAVORITES_ID
              ? <EmptyFavorites />
              : <div className="text-[#848282] text-[14px]">לא נמצאו שירותים</div>
          ) : (
            <div className="flex flex-wrap gap-5 justify-center sm:justify-start">
              {visibleSherutim.map(s => (
                <SherutCard
                  key={s.id}
                  title={s.title}
                  status={s.status}
                  favorite={s.isFavorite}
                  showIcon={showCategoryIconOnCards}
                  fullWidthOnMobile={visibleSherutim.length === 1}
                  categoryIconUrl={categoryByIdnt.get(s.idntObjectAv)?.iconUrl}
                  onClick={() => openService?.(makeCall(
                    { type: 'sherut', id: employeeId, idntSheryut: s.idntSheryut, scope: s.mfeScope, module: s.mfeModule },
                    s.mfeUrl
                  ))}
                  onToggleFavorite={() => toggleFavorite(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// עוטפים את הרכיב שנחשף דרך Module Federation בגבול שגיאות, כך שכל כשל
// (render שנזרק או fetch שנכשל בלי catch) יוצג כהודעה בתוך ה-MFE במקום להפיל את השֶׁל.
const FullWithBoundary: React.FC<Props> = (props) => (
  <ErrorBoundary>
    <Full {...props} />
  </ErrorBoundary>
);

export default FullWithBoundary;
