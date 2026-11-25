import './index.css';
import React, { useEffect } from 'react';
import { useSelectedPerson } from 'shell/personStore';
import { useTabs } from './hooks/useTabs';
import TabDetailsPanel from './components/TabDetailsPanel';

interface Props {
  extendedTabDataUrl?: string | null;
  selectedActiveTab?: number;
  /** תוכן של ה-shell בקצה השמאלי של שורה 1 (כפתור החלפת עובד) */
  headerStart?: React.ReactNode;
  /** תוכן של ה-shell בקצה הימני של שורה 1 (פרטי הזיהוי) */
  headerEnd?: React.ReactNode;
}

/**
 * הטאבים והמידע של הטאב הפעיל בכרטיס תיק העובד.
 * ה-shell הוא הבעלים של "יש עובד?" — הוא מרנדר את ה-MFE רק אחרי שהעובד נטען ונמצא
 * (טעינה / עובד לא נמצא — PortfolioHeaderFallback ב-shell). ה-MFE מטפל רק בטעינת הטאבים.
 */
const App: React.FC<Props> = ({ extendedTabDataUrl, selectedActiveTab, headerStart, headerEnd }) => {
  const person = useSelectedPerson();

  const { tabs, tabsLoading, tabDataById, openTabId, loadBaseTabs, loadMoreDataTab, toggleCard } =
    useTabs(selectedActiveTab);

  // Base tabs depend on the person — the menu on its type, the data on its id.
  // Reload when either changes (the menu itself is cached per type in tabsConfig).
  useEffect(() => {
    if (!person?.id) return;
    return loadBaseTabs(person.type, person.id);
  }, [person?.type, person?.id, loadBaseTabs]);

  // The "more data" tab depends on the person + the extended-data URL, so it loads
  // (or clears) on its own without re-triggering the base-tabs fetch above.
  useEffect(() => {
    return loadMoreDataTab(person?.id, extendedTabDataUrl);
  }, [person?.id, extendedTabDataUrl, loadMoreDataTab]);

  // שגיאה או טאבים ריקים — רק שורה 1 (זהות + החלפה), בלי הודעה.
  return (
    <div style={{ fontFamily: 'Rubik, Arial, sans-serif' }} dir="rtl">
      <TabDetailsPanel
        tabs={tabs}
        openTabId={openTabId}
        // תמיד יש טאב פתוח — לחיצה על הטאב הפתוח לא סוגרת אותו
        onSelect={tab => { if (tab.id !== openTabId) toggleCard(tab); }}
        dataById={tabDataById}
        headerStart={headerStart}
        headerEnd={headerEnd}
        loading={tabsLoading}
      />
    </div>
  );
};

export default App;
