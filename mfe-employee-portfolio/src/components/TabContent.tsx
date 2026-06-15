import React from 'react';
import type { TabData } from '../types';

interface SectionProps {
  title: string;
  data: Record<string, string>;
  isLinks?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, data, isLinks }) => {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div className="w-full">
      <div className="text-[10px] font-semibold text-[#848282] tracking-[0.4px] uppercase mb-1 pr-[2px]">
        {title}
      </div>
      <div className="flex flex-wrap gap-1">
        {entries.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center gap-[3px] px-[6px] py-[2px] bg-[#F8F9FD] rounded shrink-0"
          >
            <span className="text-[10px] text-[#848282] whitespace-nowrap">{label}:</span>
            {isLinks ? (
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1E3BA2]">
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

const AlertsSection: React.FC<{ data: Record<string, string> }> = ({ data }) => {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div className="w-full">
      <div className="text-[10px] font-semibold text-[#848282] tracking-[0.4px] uppercase mb-1 pr-[2px]">
        התראות
      </div>
      <div className="flex flex-wrap gap-[5px]">
        {entries.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center gap-[5px] bg-[#FFF0CC] border border-[#FFD580] rounded px-2 py-[2px] text-[11px] text-[#7A4F00] whitespace-nowrap"
          >
            <span>⚠</span>
            <span className="font-semibold">{label}:</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface Props {
  data: TabData;
}

// Renders the full TabData — all four sections. Used as the body of an open accordion card.
const TabContent: React.FC<Props> = ({ data }) => {
  const isEmpty = Object.values(data).every(
    section => !section || Object.keys(section).length === 0,
  );

  if (isEmpty) {
    return <div className="py-4 text-center text-[#848282] text-sm">אין נתונים להצגה</div>;
  }

  return (
    <div className="flex flex-col gap-[8px] pt-2" dir="rtl">
      <Section title="נתונים בסיסיים" data={data.basicData} />
      <AlertsSection data={data.hatrraa} />
      <Section title="נתונים מורחבים" data={data.murchavData} />
      <Section title="קישורים" data={data.links} isLinks />
    </div>
  );
};

export default TabContent;
