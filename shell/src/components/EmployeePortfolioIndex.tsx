import React, { lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SECTIONS, type Section } from '../employeeSections';
import type { OpenService } from '../types/openService';
import { useSelectedPersonType } from '../store/personStore';

const TasksMFE = lazy(() => import('mfe_tasks/App'));

const SECTION_SHOW_ALL: Record<string, (navigate: ReturnType<typeof useNavigate>, search: string) => void> = {
  sherutim: (navigate, search) => navigate(`/employee-portfolio/sherutim${search}`),
  'digital-objects': (navigate, search) => navigate(`/employee-portfolio/digital-objects${search}`),
};

const SECTION_FOCUS_ITEM: Record<string, (navigate: ReturnType<typeof useNavigate>, search: string, itemId: string, iframeUrl?: string) => void> = {
  'digital-objects': (navigate, search, itemId, iframeUrl) =>
    navigate(`/employee-portfolio/digital-objects/${itemId}${search}`, { state: { iframeUrl } }),
};

const sectionById = (id: string): Section | undefined => SECTIONS.find((s) => s.id === id);

/**
 * עמוד הבית של תיק העובד (מתחת ל-EmployeePortfolioMFE שבראש ה-Layout):
 * אובייקטים דיגיטליים — העמודה הראשית והרחבה,
 * ובצד שמאל עמודה צרה: שירותים דיגיטליים ומתחתם משימות (mfe-tasks).
 * ב-RTL הילד הראשון ב-grid נמצא מימין, ולכן הסיידבר הוא הילד השני.
 */
const EmployeePortfolioIndex: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const employeeId = searchParams.get('employeeId') ?? '';
  const objectType = useSelectedPersonType();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const renderSection = (id: string) => {
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
          onShowAll={showAll ? () => showAll(navigate, search) : undefined}
          onFocusItem={focusItem ? (itemId, iframeUrl) => focusItem(navigate, search, itemId, iframeUrl) : undefined}
        />
      </Suspense>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* הכרטיס של ה-MFE נמתח לכל גובה הסיידבר (שירותים + משימות) */}
      <main className="flex min-w-0 flex-col [&>*]:flex-1">{renderSection('digital-objects')}</main>

      <aside className="flex min-w-0 flex-col gap-4">
        {renderSection('sherutim')}
        <Suspense fallback={<div>טוען משימות...</div>}>
          <TasksMFE openService={openService} />
        </Suspense>
      </aside>
    </div>
  );
};

export default EmployeePortfolioIndex;
