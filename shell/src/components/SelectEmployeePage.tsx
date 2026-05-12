import React, { lazy, Suspense, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Service } from '../types/openService';

const SearchEmployeeMFE = lazy(() => import('mfe_search_employee/App'));

const SelectEmployeePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingSherut = location.state?.pendingSherut as Service | undefined;

  const onSelected = useCallback((idntEmployee: string) => {
    if (pendingSherut) {
      navigate(
        `/employee-portfolio/sherutim/${pendingSherut.idntMenuItem}?employeeId=${idntEmployee}`,
        { state: location.state }
      );
    } else {
      navigate(`/employee-portfolio?employeeId=${idntEmployee}`);
    }
  }, [navigate, pendingSherut, location.state]);

  return (
    <div style={{ direction: 'rtl' }}>
      {pendingSherut && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#EEF2FF', borderRadius: '8px', color: '#1E3BA2', fontSize: '14px' }}>
          בחר עובד לפתיחת השירות
        </div>
      )}
      <Suspense fallback={<div>טוען חיפוש עובד...</div>}>
        <SearchEmployeeMFE onSelected={onSelected} />
      </Suspense>
    </div>
  );
};

export default SelectEmployeePage;
