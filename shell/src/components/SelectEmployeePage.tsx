import React, { lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchEmployeeMFE = lazy(() => import('mfe_search_employee/App'));

const SelectEmployeePage: React.FC = () => {
  const navigate = useNavigate();

  const onSelected = useCallback((idntEmployee: string) => {
    navigate(`/employee-portfolio?employeeId=${idntEmployee}`);
  }, [navigate]);

  return (
    <div style={{ direction: 'rtl' }}>
      <Suspense fallback={<div>טוען חיפוש עובד...</div>}>
        <SearchEmployeeMFE onSelected={onSelected} />
      </Suspense>
    </div>
  );
};

export default SelectEmployeePage;
