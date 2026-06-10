import React from 'react';
import type { TabConfig } from '../types';

interface Props {
  tabs: TabConfig[];
  activeTabId: number;
  onTabClick: (tab: TabConfig) => void;
}

const TabsBar: React.FC<Props> = ({ tabs, activeTabId, onTabClick }) => {
  if (tabs.length === 0) return null;

  return (
    <div className="flex flex-row overflow-x-auto border-b border-[#E8EAF0]" dir="rtl">
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab)}
            className={`flex flex-col items-center gap-1 pt-[5px] px-[14px] pb-[6px] bg-transparent border-x-0 border-t-0 -mb-px cursor-pointer whitespace-nowrap text-[13px] transition-[border-color] duration-150 font-[inherit] ${isActive ? 'font-semibold' : 'font-normal'}`}
            style={{
              color: tab.color,
              borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
            }}
          >
            {tab.iconUrl && <img src={tab.iconUrl} alt="" className="w-4 h-4" />}
            <span>{tab.title || tab.displayName}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabsBar;
