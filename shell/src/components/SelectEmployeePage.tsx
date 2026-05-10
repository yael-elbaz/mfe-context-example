import React, { lazy, Suspense, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resolveRoute } from '../services/openService';

const SearchEmployeeMFE = lazy(() => import('mfe_search_employee/App'));

const SelectEmployeePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingSherut = location.state?.pendingSherut as Record<string, any> | undefined;

  const handleNavigate = useCallback((to: string) => {
    const url = new URL(to, window.location.origin);
    const employeeId = url.searchParams.get('employeeId');

    if (pendingSherut && employeeId) {
      const { url: resolvedUrl, state } = resolveRoute({ ...pendingSherut, id: employeeId });
      navigate(resolvedUrl, { state });
      return;
    }

    navigate(to);
  }, [navigate, pendingSherut]);

  return (
    <div style={{ direction: 'rtl' }}>
      {pendingSherut && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#EEF2FF', borderRadius: '8px', color: '#1E3BA2', fontSize: '14px' }}>
          בחר עובד לפתיחת השירות
        </div>
      )}
      <Suspense fallback={<div>טוען חיפוש עובד...</div>}>
        <SearchEmployeeMFE navigate={handleNavigate} />
      </Suspense>
    </div>
  );
};

export default SelectEmployeePage;
