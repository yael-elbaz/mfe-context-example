import React, { Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SECTIONS, type Section } from '../employeeSections';
import type { OpenService } from '../types/openService';
import { useSelectedPersonType } from '../store/personStore';

const SECTION_SHOW_ALL: Record<string, (navigate: ReturnType<typeof useNavigate>, search: string) => void> = {
  sherutim: (navigate, search) => navigate(`/employee-portfolio/sherutim${search}`),
  'digital-objects': (navigate, search) => navigate(`/employee-portfolio/digital-objects${search}`),
};

const SECTION_FOCUS_ITEM: Record<string, (navigate: ReturnType<typeof useNavigate>, search: string, itemId: string, iframeUrl?: string) => void> = {
  'digital-objects': (navigate, search, itemId, iframeUrl) =>
    navigate(`/employee-portfolio/digital-objects/${itemId}${search}`, { state: { iframeUrl } }),
};

// נתוני דמה — עד שיהיה MFE ייעודי לתובנות
const MOCK_INSIGHTS = [
  { title: 'חריגה בשעות נוספות', text: 'עלייה של 35% בשעות הנוספות בחודש האחרון' },
  { title: 'ימי חופשה צבורים', text: 'יתרת חופשה גבוהה מהממוצע ביחידה' },
  { title: 'הכשרה שפג תוקפה', text: 'הסמכת בטיחות דורשת חידוש עד סוף החודש' },
  { title: 'מגמת היעדרויות', text: 'ירידה בהיעדרויות ברבעון האחרון' },
  { title: 'עדכון פרטים', text: 'פרטי קשר לא עודכנו מעל שנה' },
  { title: 'הערכת ביצועים', text: 'הערכה שנתית ממתינה להשלמה' },
];

/**
 * תובנות — placeholder עד שיהיה MFE ייעודי.
 * ממלא את שארית גובה העמודה; אם התוכן גולש — גלילה פנימית ברשימה.
 */
const InsightsCard: React.FC = () => (
  <section className="flex min-h-0 flex-1 flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4" dir="rtl">
    <header>
      <h2 className="text-lg font-semibold text-navy">💡 תובנות</h2>
      <p className="text-base text-gray-muted">חריגות ומגמות</p>
    </header>
    <ul className="home-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
      {MOCK_INSIGHTS.map((i) => (
        <li key={i.title} className="rounded-lg bg-surface px-3 py-2">
          <div className="text-base font-medium text-navy">{i.title}</div>
          <div className="text-sm text-gray-muted">{i.text}</div>
        </li>
      ))}
    </ul>
  </section>
);

const sectionById = (id: string): Section | undefined => SECTIONS.find((s) => s.id === id);

/** מרנדר מקטע (Preview של MFE) לפי id, עם הניווטים של תיק העובד */
const SectionSlot: React.FC<{ id: string; openService?: OpenService; rows?: number; compact?: boolean }> = ({ id, openService, rows, compact }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const employeeId = searchParams.get('employeeId') ?? '';
  const objectType = useSelectedPersonType();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const section = sectionById(id);
  if (!section) return null;
  const { Preview } = section;
  const showAll = SECTION_SHOW_ALL[id];
  const focusItem = SECTION_FOCUS_ITEM[id];
  return (
    <Suspense fallback={<div>טוען {section.label}...</div>}>
      <Preview
        openService={openService}
        employeeId={employeeId}
        objectType={objectType}
        rows={rows}
        compact={compact}
        onShowAll={showAll ? () => showAll(navigate, search) : undefined}
        onFocusItem={focusItem ? (itemId, iframeUrl) => focusItem(navigate, search, itemId, iframeUrl) : undefined}
      />
    </Suspense>
  );
};

/**
 * העמודה השמאלית של עמוד הבית בתיק העובד: שירותים דיגיטליים ותובנות.
 * שירותים — 2 שורות (4 כרטיסים נמוכים); התובנות ממלאות את השאר וגוללות בפנים.
 * רספונסיבי:
 *  - מובייל: מתחת לאובייקטים הדיגיטליים, שירותים ותובנות אחד מתחת לשני ברוחב מלא.
 *  - טאבלט (md): מתחת לאובייקטים הדיגיטליים, זה לצד זה — 50% כל אחד.
 *  - דסקטופ (lg): עמודה צרה משמאל. h-0 + min-h-full — העמודה לא מגדילה את שורת ה-grid
 *    אלא נמתחת לגובה העמודה הימנית, וכך גלישה של התובנות הופכת לגלילה במקום להאריך את התיק.
 */
const EmployeePortfolioAside: React.FC<{ openService?: OpenService }> = ({ openService }) => (
  <aside className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:flex lg:h-0 lg:min-h-full lg:flex-col">
    <div className="min-w-0 shrink-0">
      <SectionSlot id="sherutim" openService={openService} rows={2} compact />
    </div>
    <InsightsCard />
  </aside>
);

/**
 * עמוד הבית של תיק העובד. ימין: אובייקטים דיגיטליים. שמאל: שירותים ותובנות.
 */
const EmployeePortfolioIndex: React.FC<{ openService?: OpenService }> = ({ openService }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
    <div className="flex min-w-0 flex-col [&>*]:flex-1">
      <SectionSlot id="digital-objects" openService={openService} />
    </div>
    <EmployeePortfolioAside openService={openService} />
  </div>
);

export default EmployeePortfolioIndex;
