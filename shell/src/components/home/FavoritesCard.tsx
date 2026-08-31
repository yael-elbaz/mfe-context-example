import React from 'react';

/**
 * הכרטיס העליון בעמודה השמאלית — Placeholder ל-MFE שטרם פותח (Figma 17:11878).
 * בעיצוב הכרטיס הפנימי ריק, ולכן הוא נשאר ריק גם כאן;
 * כשה-MFE ייכתב, התוכן יוזרם לתוך המסגרת הזו דרך Module Federation.
 */
const FavoritesCard: React.FC = () => (
  <section className="flex h-[375px] flex-col rounded-lg border border-[#E2E8F0] bg-white p-4">
    <div className="flex h-full flex-col items-end gap-2">
      <p className="text-[11px] leading-normal whitespace-nowrap text-[#00033D]">לכל הדיווחים</p>
      <div className="w-full flex-1 rounded-xl border border-[#E5E9EE] bg-white" />
    </div>
  </section>
);

export default FavoritesCard;
