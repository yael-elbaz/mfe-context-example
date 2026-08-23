import React, { Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SECTIONS } from '../employeeSections';
import type { OpenService } from '../types/openService';

const SECTION_SHOW_ALL: Record<string, (navigate: ReturnType<typeof useNavigate>, search: string) => void> = {
  sherutim: (navigate, search) => navigate(`/employee-portfolio/sherutim${search}`),
  'digital-objects': (navigate, search) => navigate(`/employee-portfolio/digital-objects${search}`),
};

const SECTION_FOCUS_ITEM: Record<string, (navigate: ReturnType<typeof useNavigate>, search: string, itemId: string, iframeUrl?: string) => void> = {
  'digital-objects': (navigate, search, itemId, iframeUrl) =>
    navigate(`/employee-portfolio/digital-objects/${itemId}${search}`, { state: { iframeUrl } }),
};

const EmployeePortfolioIndex: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const employeeId = searchParams.get('employeeId') ?? '';
  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {SECTIONS.map(({ id, Preview }) => {
        const showAll = SECTION_SHOW_ALL[id];
        const focusItem = SECTION_FOCUS_ITEM[id];
        return (
          <Suspense key={id} fallback={<div>טוען {id}...</div>}>
            <Preview
              openService={openService}
              employeeId={employeeId}
              onShowAll={showAll ? () => showAll(navigate, search) : undefined}
              onFocusItem={focusItem ? (itemId, iframeUrl) => focusItem(navigate, search, itemId, iframeUrl) : undefined}
            />
          </Suspense>
        );
      })}
    </div>
  );
};

export default EmployeePortfolioIndex;
