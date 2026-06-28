import React from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import SectionFullView from './SectionFullView';
import type { OpenService } from '../types/openService';

/**
 * תאימות לאחור: MFEs ישנים מנווטים ל-/employee-portfolio/:idntSheryut
 * ללא ה-segment "sherutim". מאחר ש-:section ו-:idntSheryut הם אותו דפוס URL
 * (segment בודד), ההבחנה היא לפי ערך: אם הפרמטר מספרי נתייחס אליו כ-idntSheryut
 * ונפנה ל-/employee-portfolio/sherutim/:idntSheryut. אחרת — מקטע רגיל.
 */
const LegacySectionRedirect: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const { section } = useParams<{ section: string }>();
  const [searchParams] = useSearchParams();

  if (/^\d+$/.test(section ?? '')) {
    const search = searchParams.toString();
    return (
      <Navigate
        to={`/employee-portfolio/sherutim/${section}${search ? `?${search}` : ''}`}
        replace
      />
    );
  }

  return <SectionFullView openService={openService} />;
};

export default LegacySectionRedirect;
