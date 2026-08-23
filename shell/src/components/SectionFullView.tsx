import React, { Suspense } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { SECTIONS } from '../employeeSections';
import type { OpenService } from '../types/openService';

const SectionFullView: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const { section } = useParams<{ section: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const employeeId = searchParams.get('employeeId') ?? '';
  const match = SECTIONS.find(s => s.id === section);

  if (!match) return (
    <div style={{ padding: '24px', color: '#c00', direction: 'rtl' }}>
      מקטע "{section}" לא נמצא
    </div>
  );

  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return (
    <Suspense fallback={<div>טוען...</div>}>
      <match.Full
        openService={openService}
        employeeId={employeeId}
        navigate={navigate}
        onFocusItem={(itemId, iframeUrl) => navigate(`/employee-portfolio/${match.id}/${itemId}${search}`, { state: { iframeUrl } })}
      />
    </Suspense>
  );
};

export default SectionFullView;
