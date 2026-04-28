import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { SECTIONS } from '../employeeSections';

const SectionFullView: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const match = SECTIONS.find(s => s.id === section);

  if (!match) return (
    <div style={{ padding: '24px', color: '#c00', direction: 'rtl' }}>
      מקטע "{section}" לא נמצא
    </div>
  );

  return (
    <Suspense fallback={<div>טוען...</div>}>
      <match.Full />
    </Suspense>
  );
};

export default SectionFullView;
