import React from 'react';

/* כוכב מועדפים — משמש גם בכרטיס וגם בטאב "מועדפים" */
export const IconStar: React.FC<{ filled?: boolean; className?: string }> = ({ filled, className }) => (
  <svg viewBox="0 0 20 20" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 1.7l2.32 4.7 5.18.75-3.75 3.65.88 5.16L10 13.5l-4.63 2.44.88-5.16L2.5 7.15l5.18-.75L10 1.7z" />
  </svg>
);

/* כרטיס שירות — משותף לתצוגת Full ולתצוגת Preview */
const SherutCard: React.FC<{
  title: string;
  status: string;
  favorite: boolean;
  categoryIconUrl?: string; // אייקון הקטגוריה של השירות
  onClick: () => void;
}> = ({ title, status, favorite, categoryIconUrl, onClick }) => (
  <button
    onClick={onClick}
    className="relative w-[149px] h-[193px] bg-white rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_rgba(6,77,173,0.08),0_1px_2px_rgba(6,77,173,0.06)] flex flex-col items-center justify-center gap-3 px-3 hover:border-[#2B7FFF] transition-colors"
  >
    <span className={favorite ? 'absolute top-3 left-3 text-[#F97316]' : 'absolute top-3 left-3 text-[#A0AEC0]'}>
      <IconStar filled={favorite} className="w-[18px] h-[18px]" />
    </span>

    {categoryIconUrl && (
      <span className="flex items-center justify-center w-[58px] h-[58px] rounded-2xl bg-[#F0F6FD]">
        <img src={categoryIconUrl} alt="" className="w-[30px] h-[30px]" />
      </span>
    )}

    <span className="text-[#111138] text-[13px] font-medium text-center leading-snug line-clamp-2">
      {title}
    </span>

    <span className="px-3 py-0.5 rounded-full bg-[#F0F6FD] text-[#2B7FFF] text-[11px] font-medium">
      {status}
    </span>
  </button>
);

export default SherutCard;
