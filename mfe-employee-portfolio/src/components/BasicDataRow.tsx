import React from 'react';

interface Props {
  data: Record<string, string>;
}

// Horizontal label-over-value columns for the collapsed main row (see reference design).
const BasicDataRow: React.FC<Props> = ({ data }) => {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div className="flex-1 flex flex-row-reverse flex-wrap items-center gap-x-8 gap-y-2 justify-end" dir="rtl">
      {entries.map(([label, value]) => (
        <div key={label} className="flex flex-col items-start text-right min-w-[70px]">
          <span className="text-[14px] font-normal leading-[1.25] text-[#8E929F] whitespace-nowrap mb-[2px]">{label}</span>
          <span className="text-[16px] font-normal leading-[1.25] text-[#00033D] whitespace-nowrap">{value}</span>
        </div>
      ))}
    </div>
  );
};

export default BasicDataRow;
