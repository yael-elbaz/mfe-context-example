import React, { Suspense } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { SECTIONS } from '../employeeSections';
import type { OpenService } from '../types/openService';
import { useSelectedPersonType } from '../store/personStore';
import { Helper } from '../utils/urlHelper';
import { useUrlSearch } from '../hooks/useUrlSearch';

/** מקטעים שהחיפוש החופשי שלהם נשמר ב-URL (ראו SPEC-overlay-nested-route) */
export const URL_SEARCH_SECTIONS = new Set(['digital-objects']);

interface Props {
  openService?: OpenService;
  /** המקטע — כשהראוט ייעודי (digital-objects). אחרת נלקח מ-:section */
  section?: string;
  /** התיק שהמקטע בתוכו — קובע לאן "חזרה" ו"התמקד" מנווטים */
  portfolio?: 'employee' | 'customer';
}

const SectionFullView: React.FC<Props> = ({ openService, section: sectionProp, portfolio = 'employee' }) => {
  const params = useParams<{ section: string }>();
  const section = sectionProp ?? params.section;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const urlSearch = useUrlSearch();
  // ה-state שה-Preview העביר ב-onShowAll(state)
  const previewState = (location.state as { previewState?: unknown } | null)?.previewState;
  const personId = Helper.getParam(portfolio === 'customer' ? 'customerId' : 'employeeId', searchParams) ?? '';
  const objectType = useSelectedPersonType();
  const match = SECTIONS.find(s => s.id === section);

  if (!match) return (
    <div style={{ padding: '24px', color: '#c00', direction: 'rtl' }}>
      מקטע "{section}" לא נמצא
    </div>
  );

  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const root = `/${portfolio}-portfolio`;

  // "חזרה" מכל מקטע במצב מלא — חזרה לתיק (עם אותם פרמטרים, כולל employeeId / customerId)
  const backToPreview = () => navigate(`${root}${search}`);
  // תצוגת iframe של פריט קיימת רק בתיק העובד
  const onFocusItem = portfolio === 'employee'
    ? (itemId: string, iframeUrl?: string) => navigate(`${root}/${match.id}/${itemId}${search}`, { state: { iframeUrl } })
    : undefined;

  return (
    <Suspense fallback={<div>טוען...</div>}>
      <match.Full
        openService={openService}
        employeeId={personId}
        objectType={objectType}
        backToPreview={backToPreview}
        previewState={previewState}
        onFocusItem={onFocusItem}
        {...(URL_SEARCH_SECTIONS.has(match.id) ? urlSearch : {})}
      />
    </Suspense>
  );
};

export default SectionFullView;
