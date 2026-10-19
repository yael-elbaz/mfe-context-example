import React, { lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelectedPersonType } from '../store/personStore';
import type { OpenService } from '../types/openService';
import { mfe } from './MfeSlot';

const SherutimPreviewMFE = lazy(() => import('mfe_sherutim/Preview'));
const SherutimFullMFE = lazy(() => import('mfe_sherutim/Full'));

/** תצוגה מקדימה של השירותים בתיק הלקוח — מסוננת לפי סוג האדם הנבחר (objectType) */
export const CustomerSherutimPreview: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const objectType = useSelectedPersonType();
  const customerId = searchParams.get('customerId') ?? '';

  return mfe('טוען שירותים...', SherutimPreviewMFE, {
    openService,
    employeeId: customerId,
    objectType,
    onShowAll: () => navigate(`/customer-portfolio/sherutim?${searchParams.toString()}`),
  });
};

/** כל השירותים בתיק הלקוח — "חזרה" מחזיר לתיק הלקוח */
export const CustomerSherutimFull: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const objectType = useSelectedPersonType();
  const customerId = searchParams.get('customerId') ?? '';

  return mfe('טוען שירותים...', SherutimFullMFE, {
    openService,
    employeeId: customerId,
    objectType,
    navigate,
    onBack: () => navigate(`/customer-portfolio?${searchParams.toString()}`),
  });
};
