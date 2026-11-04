import React, { Suspense } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { SECTIONS } from '../employeeSections';
import type { OpenService } from '../types/openService';
import { useSelectedPersonType } from '../store/personStore';

const SectionFullView: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const { section } = useParams<{ section: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  // ה-state שה-Preview העביר ב-onShowAll(state)
  const previewState = (location.state as { previewState?: unknown } | null)?.previewState;
  const employeeId = searchParams.get('employeeId') ?? '';
  const objectType = useSelectedPersonType();
  const match = SECTIONS.find(s => s.id === section);

  if (!match) return (
    <div style={{ padding: '24px', color: '#c00', direction: 'rtl' }}>
      מקטע "{section}" לא נמצא
    </div>
  );

  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

  // "חזרה" מכל מקטע במצב מלא — חזרה לתיק העובד (עם אותם פרמטרים, כולל employeeId)
  const backToPreview = () => navigate(`/employee-portfolio${search}`);

  return (
    <Suspense fallback={<div>טוען...</div>}>
      <match.Full
        openService={openService}
        employeeId={employeeId}
        objectType={objectType}
        backToPreview={backToPreview}
        previewState={previewState}
        onFocusItem={(itemId, iframeUrl) => navigate(`/employee-portfolio/${match.id}/${itemId}${search}`, { state: { iframeUrl } })}
      />
    </Suspense>
  );
};

export default SectionFullView;
