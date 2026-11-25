import React from 'react';
import type { TabConfig, TabData } from '../types';
import { useExpandedRow } from '../hooks/useExpandedRow';
import TabStrip from './TabStrip';
import TabBody from './TabBody';
import { FieldsSkeleton, TabsSkeleton } from './Skeleton';

interface Props {
  tabs: TabConfig[];
  openTabId: number | null;
  onSelect: (tab: TabConfig) => void;
  dataById: Record<number, TabData>;
  /** Shell content at the left end of row 1 (RTL) — the "switch employee" button. */
  headerStart?: React.ReactNode;
  /** Shell content at the right end of row 1 (RTL) — the employee's identity. */
  headerEnd?: React.ReactNode;
  /**
   * true — skeleton in place of the tabs and row 2.
   * false — the tabs and the active tab's data (no tabs / load error → just row 1).
   */
  loading: boolean;
}

/**
 * התוכן של כרטיס תיק העובד (המסגרת עצמה — ב-shell):
 *  שורה 1 — [זהות (shell)] [טאבים] [החלפת עובד (shell)]
 *  שורה 2 — המידע של הטאב הפעיל (ראו TabBody).
 * ה-shell הוא הבעלים של הזהות וההחלפה; ה-MFE רק מחליט איפה הם יושבים, כי רק הוא יודע לפרוס את הטאבים.
 */
const TabDetailsPanel: React.FC<Props> = ({ tabs, openTabId, onSelect, dataById, headerStart, headerEnd, loading }) => {
  const { expanded, toggleExpanded } = useExpandedRow();
  const data = !loading && openTabId != null ? dataById[openTabId] : undefined;
  const hasRow2 = loading || !!data;

  return (
    <div className="flex flex-col" dir="rtl">
      <div className={`flex h-[76px] items-center gap-5 bg-[#F7FAFC] px-5 ${
        hasRow2 ? 'rounded-t-xl border-b border-[#E2E8F0]' : 'rounded-xl'
      }`}>
        {headerEnd}
        {loading
          ? <TabsSkeleton />
          : tabs.length > 0
            ? <TabStrip tabs={tabs} openTabId={openTabId} onSelect={onSelect} />
            : <div className="flex-1" />}
        {headerStart}
      </div>
      {loading && <FieldsSkeleton />}
      {data && <TabBody data={data} expanded={expanded} onToggleExpanded={toggleExpanded} />}
    </div>
  );
};

export default TabDetailsPanel;
