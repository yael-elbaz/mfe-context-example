import React from 'react';
import { Outlet } from 'react-router-dom';
import SectionFullView from './SectionFullView';
import type { OpenService } from '../types/openService';

interface Props {
  portfolio: 'employee' | 'customer';
  openService?: OpenService;
}

/**
 * דף האובייקטים הדיגיטליים בתיק, והורה של שירותי האוברליי (digital-objects/sherutim/:id).
 * SectionFullView נשאר mounted כשהאוברליי נפתח ונסגר — רק תוכן ה-Outlet מתחלף —
 * ולכן הסינונים, החיפוש והגלילה נשמרים. ServiceOverlay הוא position: fixed, כך שהוא צף מעל הדף.
 */
const DigitalObjectsPage: React.FC<Props> = ({ portfolio, openService }) => (
  <>
    <SectionFullView section="digital-objects" portfolio={portfolio} openService={openService} />
    <Outlet />
  </>
);

export default DigitalObjectsPage;
