import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SECTIONS } from '../employeeSections';
import type { OpenService } from '../types/openService';

const SectionFullView: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const { section } = useParams<{ section: string }>();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId') ?? '';
  const match = SECTIONS.find(s => s.id === section);

  if (!match) return (
    <div style={{ padding: '24px', color: '#c00', direction: 'rtl' }}>
      מקטע "{section}" לא נמצא
    </div>
  );

  return (
    <Suspense fallback={<div>טוען...</div>}>
      <match.Full openService={openService} employeeId={employeeId} />
    </Suspense>
  );
};

export default SectionFullView;
