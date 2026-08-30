import React from 'react';
import { SherutBubbleGraphic, SherutStarIcon } from './sectionIcons';

/* כרטיס שירות — Figma "SERVES" (17:11016).
   ברירת המחדל היא כרטיס גמיש בגובה 184 כפי שהוא מופיע בשורת השירותים בדף הבית. */
const SherutCard: React.FC<{
  title: string;
  status: string;
  favorite: boolean;
  categoryIconUrl?: string; // אייקון הקטגוריה של השירות (עשוי להיות חסר)
  className?: string;
  onClick: () => void;
}> = ({ title, status, favorite, categoryIconUrl, className, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex h-[184px] min-w-0 flex-col items-center justify-center gap-[19px] rounded-lg border border-[#E2E8F0] bg-white p-4 transition-colors hover:border-[#2B7FFF] ${className ?? 'flex-1'}`}
  >
    {/* כוכב מועדפים — פינה שמאלית עליונה (RTL) */}
    <span className={`absolute top-[11px] left-[10px] ${favorite ? 'text-[#F97316]' : 'text-black'}`}>
      <SherutStarIcon filled={favorite} />
    </span>

    {/* Bubble — 50×50, radius 8, רקע #F5F7FA */}
    <span className="flex size-[50px] shrink-0 items-center justify-center rounded-lg bg-[#F5F7FA]">
      {categoryIconUrl
        ? <img src={categoryIconUrl} alt="" className="h-[30px] w-[30px]" />
        : <SherutBubbleGraphic />}
    </span>

    <span className="flex w-full flex-col items-center gap-2">
      <span className="line-clamp-1 w-full text-center text-[16px] font-normal leading-6 text-[#111138]">
        {title}
      </span>
      <span className="flex items-center justify-center rounded-lg bg-[#F0F6FD] px-1.5 text-center text-[12px] font-medium leading-4 tracking-[0.1px] whitespace-nowrap text-[#2B7FFF]">
        {status}
      </span>
    </span>
  </button>
);

export default SherutCard;
