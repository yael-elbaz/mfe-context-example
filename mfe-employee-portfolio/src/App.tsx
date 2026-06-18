import './index.css';
import React, { useEffect } from 'react';
import { useEmployee, useEmployeeLoading } from 'shell/employeeStore';
import { useTabs } from './hooks/useTabs';
import TabStrip from './components/TabStrip';
import TabContent from './components/TabContent';
import BasicDataRow from './components/BasicDataRow';
import EmployeeAvatar from './components/EmployeeAvatar';

interface Props {
  navigate?: (to: string) => void;
  extendedTabDataUrl?: string | null;
  selectedActiveTab?: number;
}

const App: React.FC<Props> = ({ navigate, extendedTabDataUrl, selectedActiveTab }) => {
  const employee = useEmployee();
  const loading = useEmployeeLoading();

  const {
    tabs, tabsLoading, tabsError,
    activeTabData, tabDataById,
    isExpanded, openTabId, loadBaseTabs, loadMoreDataTab, toggleExpanded, toggleCard,
  } = useTabs(selectedActiveTab);

  // Base tabs depend only on the employee — reload when the employee changes.
  useEffect(() => {
    if (!employee?.id) return;
    return loadBaseTabs(employee.id);
  }, [employee?.id, loadBaseTabs]);

  // The "more data" tab depends on the employee + the extended-data URL, so it loads
  // (or clears) on its own without re-triggering the base-tabs fetch above.
  useEffect(() => {
    return loadMoreDataTab(employee?.id, extendedTabDataUrl);
  }, [employee?.id, extendedTabDataUrl, loadMoreDataTab]);

  const openTab = tabs.find(t => t.id === openTabId) ?? null;

  if (loading) {
    return (
      <div className="p-4 text-center text-[#888888]" style={{ fontFamily: 'Rubik, Arial, sans-serif' }}>
        ⏳ טוען...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-4 text-center text-[#cc0000]" style={{ fontFamily: 'Rubik, Arial, sans-serif' }}>
        עובד לא נמצא —{' '}
        <button
          onClick={() => navigate?.('/')}
          className="cursor-pointer text-[#1E3BA2] bg-transparent border-0 p-0 font-[inherit]"
        >
          חזרה לחיפוש
        </button>
      </div>
    );
  }

  const renderMainRowContent = () => {
    if (tabsError)   return <div className="flex-1 text-[#cc0000] text-xs">שגיאה בטעינת נתונים</div>;
    if (tabsLoading) return <div className="flex-1 text-[#888888] text-xs">⏳ טוען...</div>;
    if (activeTabData) return <BasicDataRow data={activeTabData.basicData} />;
    return <div className="flex-1 text-[#848282] text-sm">אין נתונים להצגה עבור עובד זה</div>;
  };

  return (
    <div
      className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden"
      style={{ fontFamily: 'Rubik, Arial, sans-serif' }}
      dir="rtl"
    >
      {/* ── Main row: avatar (right) + active tab's basic data + expand icon ── */}
      <div className="flex items-center gap-4 p-6 h-[116px]">
        <EmployeeAvatar employee={employee} />

        {renderMainRowContent()}

        <button
          onClick={() => navigate?.('/')}
          className="shrink-0 bg-transparent border-0 cursor-pointer text-[#848282] text-xs p-0 font-[inherit]"
        >
          ← חזרה
        </button>

        {tabs.length > 0 && (
          <button
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'כווץ' : 'הרחב'}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[#F0F2F8] border-0 cursor-pointer text-[#1B2B6B]"
          >
            <span
              className="inline-block transition-transform duration-200 text-[11px]"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▼
            </span>
          </button>
        )}
      </div>

      {/* ── Expandable panel: horizontal strip of tab cards + selected card's data ── */}
      <div
        className="grid transition-[grid-template-rows] duration-[250ms] ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-4 pb-3 pt-2 border-t border-[#E8EAF0]">
            <TabStrip tabs={tabs} openTabId={openTabId} onSelect={toggleCard} />
            {openTab && tabDataById[openTab.id] && (
              <div className="rounded-lg border border-[#E8EAF0] p-3">
                <TabContent data={tabDataById[openTab.id]} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
