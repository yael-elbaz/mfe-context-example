import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { TabConfig } from '../types';

interface Props {
  tabs: TabConfig[];
  openTabId: number | null;
  onSelect: (tab: TabConfig) => void;
}

// Horizontal, scrollable row of tab cards. Shows left/right arrows only when the
// cards overflow the available width.
const TabStrip: React.FC<Props> = ({ tabs, openTabId, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (el) setOverflow(el.scrollWidth > el.clientWidth + 1);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tabs.length, checkOverflow]);

  const scrollBy = (dir: number) =>
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });

  const Arrow: React.FC<{ dir: number; glyph: string }> = ({ dir, glyph }) => (
    <button
      onClick={() => scrollBy(dir)}
      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#F0F2F8] border-0 cursor-pointer text-[#1B2B6B] text-xs"
    >
      {glyph}
    </button>
  );

  return (
    <div className="flex items-center gap-1" dir="rtl">
      {overflow && <Arrow dir={1} glyph="›" />}

      <div
        ref={scrollRef}
        className="flex-1 flex flex-row gap-2 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map(tab => {
          const isOpen = tab.id === openTabId;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab)}
              className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border bg-white cursor-pointer font-[inherit] whitespace-nowrap"
              style={{
                borderColor: isOpen ? tab.color : '#E8EAF0',
                borderRightWidth: '4px',
                borderRightColor: tab.color,
                background: isOpen ? `${tab.color}14` : '#FFFFFF',
              }}
            >
              {tab.iconUrl && <img src={tab.iconUrl} alt="" className="w-4 h-4" />}
              <span
                className={`text-[13px] ${isOpen ? 'font-semibold' : 'font-normal'}`}
                style={{ color: tab.color }}
              >
                {tab.title || tab.displayName}
              </span>
            </button>
          );
        })}
      </div>

      {overflow && <Arrow dir={-1} glyph="‹" />}
    </div>
  );
};

export default TabStrip;
