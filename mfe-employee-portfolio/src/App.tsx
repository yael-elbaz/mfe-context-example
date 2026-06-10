import './index.css';
import React, { useEffect } from 'react';
import { useEmployee, useEmployeeLoading } from 'shell/employeeStore';
import type { MoreDataTab } from './types';
import { useTabs } from './hooks/useTabs';
import TabsBar from './components/TabsBar';
import TabContent from './components/TabContent';
import EmployeeIdentity from './components/EmployeeIdentity';

interface Props {
  navigate?: (to: string) => void;
  moreDataTab?: MoreDataTab | null;
  selectedActiveTab?: number;
}

const App: React.FC<Props> = ({ navigate, moreDataTab, selectedActiveTab  }) => {
  const employee = useEmployee();
  const loading = useEmployeeLoading();

  const {
    tabs, tabsLoading, tabsError,
    activeTab, tabData, tabDataLoading, tabDataError,
    isExpanded, loadTabs, loadTabData, handleTabClick,
  } = useTabs();

  useEffect(() => {
    if (!employee?.id) return;
    return loadTabs(employee.id, moreDataTab, selectedActiveTab);
  }, [employee?.id, moreDataTab, selectedActiveTab, loadTabs]);

  useEffect(() => {
    if (!activeTab || !employee?.id) return;
    return loadTabData(activeTab, employee.id);
  }, [activeTab, employee?.id, loadTabData]);

  const alerts = tabData ? Object.entries(tabData.hatrraa) : [];

  const renderTabsBar = () => {
    if (tabsError)   return <div className="px-4 py-2 text-[#cc0000] text-xs border-t border-[#E8EAF0]">שגיאה בטעינת נתונים</div>;
    if (tabsLoading) return <div className="px-4 py-2 text-[#888888] text-xs border-t border-[#E8EAF0]">⏳ טוען...</div>;
    return <TabsBar tabs={tabs} activeTabId={activeTab?.id ?? -999} onTabClick={handleTabClick} />;
  };

  const renderTabContent = () => {
    if (tabDataError)   return <div className="py-[10px] text-[#cc0000] text-xs">שגיאה בטעינת נתונים</div>;
    if (tabDataLoading) return <div className="py-[10px] text-[#888888] text-xs">⏳ טוען נתוני טאב...</div>;
    if (tabData)        return <TabContent key={activeTab?.id} data={tabData} />;
    return null;
  };

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

  return (
    <div
      className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.10)] overflow-hidden"
      style={{ fontFamily: 'Rubik, Arial, sans-serif' }}
      dir="rtl"
    >
      {/* ── Identity row ── */}
      <div className="flex items-center gap-3 px-4 py-1 min-h-[40px]">

        <EmployeeIdentity employee={employee} />

        <div className="flex-1 flex flex-wrap gap-[5px] justify-end">
          {alerts.map(([label, value]) => (
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

        <div className="shrink-0">
          <button
            onClick={() => navigate?.('/')}
            className="bg-transparent border-0 cursor-pointer text-[#848282] text-xs p-0 font-[inherit]"
          >
            ← חזרה
          </button>
        </div>
      </div>

      {/* ── Tabs bar ── */}
      {renderTabsBar()}

      {/* ── Expandable tab content panel ── */}
      <div
        className="grid transition-[grid-template-rows] duration-[250ms] ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-3 border-t border-[#E8EAF0]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
