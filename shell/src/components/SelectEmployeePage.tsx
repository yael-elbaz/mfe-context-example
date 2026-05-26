import React, { lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PersonType } from '../types/openService';

const SearchPersonMFE = lazy(() => import('mfe_search_employee/App'));

const SelectEmployeePage: React.FC = () => {
  const navigate = useNavigate();

  const onSelected = useCallback((id: string, personType: PersonType) => {
    if (personType === 'employee') navigate(`/employee-portfolio?employeeId=${id}`);
    if (personType === 'customer') navigate(`/customer-portfolio?customerId=${id}`);
  }, [navigate]);

  return (
    <div style={{ direction: 'rtl' }}>
      <Suspense fallback={<div>טוען חיפוש...</div>}>
        <SearchPersonMFE onSelected={onSelected} />
      </Suspense>
    </div>
  );
};

export default SelectEmployeePage;
