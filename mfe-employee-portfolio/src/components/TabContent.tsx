import React, { useState } from 'react';
import type { TabData } from '../types';

interface SectionProps {
  title?: string;
  data: Record<string, string>;
  isLinks?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, data, isLinks }) => {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div className="w-full">
      {title && (
        <div className="text-[10px] font-semibold text-[#848282] tracking-[0.4px] uppercase mb-1 pr-[2px]">
          {title}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {entries.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center gap-[3px] px-[6px] py-[2px] bg-[#F8F9FD] rounded shrink-0"
          >
            <span className="text-[10px] text-[#848282] whitespace-nowrap">{label}:</span>
            {isLinks ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1E3BA2]"
              >
                {label}
              </a>
            ) : (
              <span className="text-[11px] text-[#00033D] font-medium">{value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface Props {
  data: TabData;
}

const TabContent: React.FC<Props> = ({ data }) => {
  const [showMore, setShowMore] = useState(false);

  const hasMore =
    Object.keys(data.murchavData).length > 0 ||
    Object.keys(data.links).length > 0;

  if (Object.keys(data.basicData).length === 0 && !hasMore) {
    return (
      <div className="py-4 text-center text-[#848282] text-sm">
        אין נתונים להצגה
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[6px] pt-2" dir="rtl">

      <Section data={data.basicData} />

      {/* More sections — slide in/out */}
      <div
        className="grid transition-[grid-template-rows] duration-[220ms] ease-in-out"
        style={{ gridTemplateRows: showMore ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-[6px] pt-[2px]">
            <Section title="נתונים מורחבים" data={data.murchavData} />
            <Section title="קישורים" data={data.links} isLinks />
          </div>
        </div>
      </div>

      {hasMore && (
        <button
          onClick={() => setShowMore(v => !v)}
          className="self-end bg-transparent border-0 cursor-pointer text-[#1E3BA2] text-[11px] py-[2px] px-0 font-[inherit] flex items-center gap-[3px]"
        >
          <span
            className="inline-block transition-transform duration-[220ms] text-[9px]"
            style={{ transform: showMore ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >▼</span>
          {showMore ? 'פחות נתונים' : 'עוד נתונים'}
        </button>
      )}

    </div>
  );
};

export default TabContent;
