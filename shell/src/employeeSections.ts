import React, { lazy } from 'react';
import { SherutimPreview, SherutimFull } from './sections/SherutimSection';

export interface Section {
  id: string;
  label: string;
  Preview: React.ComponentType;
  Full: React.ComponentType;
}

const DigitalObjectsPreview = lazy(() => import('mfe_digital_objects/Preview'));
const DigitalObjectsFull = lazy(() => import('mfe_digital_objects/Full'));

export const SECTIONS: Section[] = [
  {
    id: 'sherutim',
    label: 'שירותים דיגיטליים',
    Preview: SherutimPreview,
    Full: SherutimFull,
  },
  {
    id: 'digital-objects',
    label: 'אובייקטים דיגיטליים',
    Preview: DigitalObjectsPreview,
    Full: DigitalObjectsFull,
  },
];
