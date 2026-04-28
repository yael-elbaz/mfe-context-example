import React, { Suspense } from 'react';
import { SECTIONS } from '../employeeSections';

const EmployeePortfolioIndex: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {SECTIONS.map(({ id, Preview }) => (
      <Suspense key={id} fallback={<div>טוען {id}...</div>}>
        <Preview />
      </Suspense>
    ))}
  </div>
);

export default EmployeePortfolioIndex;
