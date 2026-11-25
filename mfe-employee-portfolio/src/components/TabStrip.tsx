import React, { useRef, useState, useCallback } from 'react';
import type { TabConfig } from '../types';
import { useFitChildren } from '../hooks/useFitChildren';
import { ChevronDownIcon } from './DataChips';
import Popover from './Popover';

interface Props {
  tabs: TabConfig[];
  openTabId: number | null;
  onSelect: (tab: TabConfig) => void;
}

/** Flat tabs in row 1 of the portfolio card; tabs that don't fit go behind "עוד (N)". */
const TabStrip: React.FC<Props> = ({ tabs, openTabId, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const onHiddenChange = useCallback((ids: string[]) => {
    setHiddenIds(curr => (curr.join(',') === ids.join(',') ? curr : ids));
  }, []);
  useFitChildren(ref, onHiddenChange, [tabs]);

  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  const closeMore = useCallback(() => setMoreAnchor(null), []);

  const hiddenTabs = tabs.filter(t => hiddenIds.includes(String(t.id)));
  const activeIsHidden = hiddenTabs.some(t => t.id === openTabId);

  const tabClass = (active: boolean) =>
    `flex h-full shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-0 border-b-[3px] border-solid bg-transparent px-2.5 py-2 font-[inherit] text-sm ${
      active ? 'border-b-[#006AFF] font-semibold text-[#006AFF]' : 'border-b-transparent font-medium text-[#4A5568] hover:text-[#00033D]'
    }`;

  return (
    <div className="flex h-full min-w-0 flex-1 items-stretch" dir="rtl">
      {/* flex-1 basis-0 — הרוחב לא תלוי בתוכן, כדי שהמדידה תתייצב */}
      <div ref={ref} className="flex min-w-0 flex-1 basis-0 items-stretch overflow-hidden">
        {tabs.map(tab => {
          const isOpen = tab.id === openTabId;
          return (
            <button
              key={tab.id}
              data-key={tab.id}
              type="button"
              onClick={() => onSelect(tab)}
              aria-pressed={isOpen}
              className={tabClass(isOpen)}
            >
              {tab.iconUrl && <img src={tab.iconUrl} alt="" className="size-[18px]" />}
              {tab.title || tab.displayName}
            </button>
          );
        })}
      </div>

      {hiddenTabs.length > 0 && (
        <button
          type="button"
          onClick={e => { const a = e.currentTarget; setMoreAnchor(curr => (curr ? null : a)); }}
          aria-expanded={!!moreAnchor}
          aria-haspopup="menu"
          className={tabClass(activeIsHidden)}
        >
          עוד ({hiddenTabs.length})
          <ChevronDownIcon size={16} className={`transition-transform ${moreAnchor ? 'rotate-180' : ''}`} />
        </button>
      )}

      {moreAnchor && (
        <Popover anchor={moreAnchor} onClose={closeMore}>
          <div role="menu" className="flex flex-col">
            {hiddenTabs.map(tab => {
              const isOpen = tab.id === openTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="menuitem"
                  onClick={() => { onSelect(tab); closeMore(); }}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-2 py-1.5 text-right font-[inherit] text-sm hover:bg-[#F7FAFC] ${
                    isOpen ? 'font-semibold text-[#006AFF]' : 'font-medium text-[#4A5568]'
                  }`}
                >
                  {tab.iconUrl && <img src={tab.iconUrl} alt="" className="size-[18px]" />}
                  {tab.title || tab.displayName}
                </button>
              );
            })}
          </div>
        </Popover>
      )}
    </div>
  );
};

export default TabStrip;
