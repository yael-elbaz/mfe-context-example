import React from 'react';

/**
 * Diagonal arrow — האייקון (outline/diagonal-arrow-left-up, 12×12 בתוך ריבוע 24)
 * יושב בתוך tile 40×40 עם radius 8 ו-padding 8 (Figma 17:11657).
 * ה-tile שקוף במצב רגיל ומקבל את background/neutral-secondlevel בריחוף על הכפתור;
 * הוא נוכח תמיד בפריסה כדי שכלום לא יזוז בין המצבים.
 */
const DiagonalArrowIcon: React.FC = () => (
  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg p-2 transition-colors group-hover:bg-[#F1F5FB] group-focus-visible:bg-[#F1F5FB]">
    <span className="inline-flex size-6 shrink-0 items-center justify-center overflow-hidden">
      <svg width="12" height="12" viewBox="0 0 12.0003 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.7071 10.293L3.41805 2.004L9.00105 2C9.55305 2 10.0001 1.551 10.0001 0.999C10.0001 0.447 9.55205 0 9.00005 0H8.99905L1.04905 0.00600004C0.499053 0.00700004 0.0540533 0.451 0.0500533 1L2.64009e-05 8.994C-0.00394684 9.546 0.441053 9.997 0.994053 10H1.00005C1.55005 10 1.99605 9.556 2.00005 9.006L2.03505 3.449L10.2931 11.707C10.4881 11.902 10.7441 12 11.0001 12C11.2561 12 11.5121 11.902 11.7071 11.707C12.0981 11.316 12.0981 10.684 11.7071 10.293Z" fill="#00033D" />
      </svg>
    </span>
  </span>
);

/* outline/options-2 — 20×18 בתוך ריבוע 24 */
const OptionsIcon: React.FC = () => (
  <span className="inline-flex size-6 shrink-0 items-center justify-center overflow-hidden">
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 16C8.448 16 8 15.552 8 15C8 14.448 8.448 14 9 14C9.552 14 10 14.448 10 15C10 15.552 9.552 16 9 16ZM19 14H11.815C11.401 12.839 10.302 12 9 12C7.698 12 6.599 12.839 6.185 14H1C0.447 14 0 14.447 0 15C0 15.553 0.447 16 1 16H6.185C6.599 17.161 7.698 18 9 18C10.302 18 11.401 17.161 11.815 16H19C19.553 16 20 15.553 20 15C20 14.447 19.553 14 19 14ZM17 10C16.448 10 16 9.552 16 9C16 8.448 16.448 8 17 8C17.552 8 18 8.448 18 9C18 9.552 17.552 10 17 10ZM17 6C15.698 6 14.599 6.839 14.185 8H1C0.447 8 0 8.447 0 9C0 9.553 0.447 10 1 10H14.185C14.599 11.161 15.698 12 17 12C18.654 12 20 10.654 20 9C20 7.346 18.654 6 17 6ZM5 2C5.552 2 6 2.448 6 3C6 3.552 5.552 4 5 4C4.448 4 4 3.552 4 3C4 2.448 4.448 2 5 2ZM1 4H2.185C2.599 5.161 3.698 6 5 6C6.302 6 7.401 5.161 7.815 4H19C19.553 4 20 3.553 20 3C20 2.447 19.553 2 19 2H7.815C7.401 0.839 6.302 0 5 0C3.698 0 2.599 0.839 2.185 2H1C0.447 2 0 2.447 0 3C0 3.553 0.447 4 1 4Z" fill="#0C3058" />
    </svg>
  </span>
);

/**
 * כפתור ה-options הסטנדרטי של הדר הסקשן.
 * מיועד להיות מוזרם ל-prop `actions` ע"י ה-MFE שרוצה אותו.
 */
export const OptionsButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} aria-label="אפשרויות" className="cursor-pointer">
    <OptionsIcon />
  </button>
);

interface Props {
  /** כותרת הסקשן — Heading/h4 */
  title: string;
  /** טקסט הקישור בצד שמאל (RTL) */
  linkLabel: string;
  /** מספר בתוך ה-badge העגול */
  count: number;
  /** התווית לצד ה-badge */
  countLabel: string;
  /**
   * סלוט פעולות משמאל לקבוצת ה-badge — פילטר, options, או כל שילוב.
   * כאן יושבת השונות בין הסקשנים, כך שאין צורך בדגל בוליאני חדש לכל וריאציה.
   */
  actions?: React.ReactNode;
  onLinkClick?: () => void;
  children: React.ReactNode;
}

/**
 * כרטיס סקשן בדף הבית — כותרת + תוכן.
 * bg לבן, border #E2E8F0, radius 8, padding 16, gap 16 (Figma 17:11899).
 *
 * מוחשף ל-MFEs דרך Module Federation כ-`shell/SectionCard`.
 * ה-MFE הוא זה שמרנדר אותו — הוא מחזיק את הדאטה (count), את הניווט
 * ואת הפעולות בהדר, ולעתים מרנדר יותר מסקשן אחד.
 */
const SectionCard: React.FC<Props> = ({
  title, linkLabel, count, countLabel, actions, onLinkClick, children,
}) => (
  <section className="flex w-full flex-col items-end gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
    <header className="flex w-full items-start justify-between">
      {/* צד ימין — כותרת + מונה */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold leading-6 text-[#00033D]">{title}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-normal leading-[1.25] text-[#8E929F]">{countLabel}</p>
            <span className="flex size-6 flex-col items-center justify-center rounded-full bg-[#E6F4FF] px-2 py-1 text-sm font-medium leading-none text-[#006AFF]">
              {count}
            </span>
          </div>
          {actions}
        </div>
      </div>

      {/* צד שמאל — קישור "לכל ה..." (Figma 17:11885) */}
      <button
        type="button"
        onClick={onLinkClick}
        className="group flex cursor-pointer items-center justify-end gap-2 rounded-lg"
      >
        <span className="text-base font-normal leading-[1.25] text-[#00033D]">{linkLabel}</span>
        <DiagonalArrowIcon />
      </button>
    </header>

    {children}
  </section>
);

export default SectionCard;
