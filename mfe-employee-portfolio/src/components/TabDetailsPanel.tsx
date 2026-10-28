import React, { useMemo } from 'react';
import type { TabConfig, TabData } from '../types';
import { usePinnedSections } from '../hooks/usePinnedSections';
import { nonEmpty } from './DataChips';
import TabStrip from './TabStrip';
import TabBody from './TabBody';

interface Props {
  tabs: TabConfig[];
  openTabId: number | null;
  onSelect: (tab: TabConfig) => void;
  dataById: Record<number, TabData>;
}

/**
 * תצוגה חסכנית בגובה מתחת להדר הפנימי של התיק (מצב details):
 *  שורה 1 — הטאבים, עם מונה התראות על כל טאב.
 *  שורה 2 — המידע של הטאב הפעיל לרוחב (ראו TabBody), ומתחתיה הפסים שהמשתמש נעץ.
 * רק הטאב הפעיל נמצא ב-DOM; המידע של כל הטאבים כבר בזיכרון (useTabs טוען הכל במקביל).
 */
const TabDetailsPanel: React.FC<Props> = ({ tabs, openTabId, onSelect, dataById }) => {
  const { pinned, pin, unpin } = usePinnedSections();

  const alertCounts = useMemo(
    () => Object.fromEntries(tabs.map(t => [t.id, nonEmpty(dataById[t.id]?.hatrraa).length])),
    [tabs, dataById],
  );

  const data = openTabId != null ? dataById[openTabId] : undefined;

  return (
    <div className="flex flex-col" dir="rtl">
      <div className="border-b border-[#E8EAF0]">
        <TabStrip tabs={tabs} openTabId={openTabId} onSelect={onSelect} look="underline" badges={alertCounts} />
      </div>
      {data && <TabBody data={data} pinned={pinned} onPin={pin} onUnpin={unpin} />}
    </div>
  );
};

export default TabDetailsPanel;
