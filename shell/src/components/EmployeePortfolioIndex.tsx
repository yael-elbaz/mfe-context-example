import React, { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SECTIONS } from '../employeeSections';
import type { OpenService } from '../types/openService';

const EmployeePortfolioIndex: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId') ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {SECTIONS.map(({ id, Preview }) => (
        <Suspense key={id} fallback={<div>טוען {id}...</div>}>
          <Preview openService={openService} employeeId={employeeId} />
        </Suspense>
      ))}
    </div>
  );
};

export default EmployeePortfolioIndex;
