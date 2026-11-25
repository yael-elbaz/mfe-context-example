import React from 'react';

/** פס אפור מהבהב — אבן הבניין של הסקלטון */
export const Bar: React.FC<{ className: string }> = ({ className }) => (
  <span aria-hidden className={`block animate-pulse rounded bg-[#E2E8F0] ${className}`} />
);

/** במקום הטאבים בשורה 1 */
export const TabsSkeleton: React.FC = () => (
  <div className="flex min-w-0 flex-1 items-center gap-6 overflow-hidden" aria-hidden>
    {['w-20', 'w-16', 'w-24', 'w-16', 'w-20'].map((w, i) => (
      <div key={i} className="flex shrink-0 items-center gap-1.5">
        <Bar className="size-[18px] rounded-full" />
        <Bar className={`h-3.5 ${w}`} />
      </div>
    ))}
  </div>
);

/** במקום שורה 2 — שדות (תווית מעל ערך) */
export const FieldsSkeleton: React.FC = () => (
  <div className="flex min-h-9 items-center gap-9 overflow-hidden px-5 py-3" aria-hidden>
    {['w-16', 'w-24', 'w-20', 'w-28', 'w-16', 'w-20'].map((w, i) => (
      <div key={i} className="flex shrink-0 flex-col gap-1.5">
        <Bar className="h-2.5 w-12" />
        <Bar className={`h-3.5 ${w}`} />
      </div>
    ))}
  </div>
);
