import React, { lazy } from 'react';
import type { OpenService } from './types/openService';

export interface SectionProps {
  openService?: OpenService;
  employeeId?: string;
  onShowAll?: () => void;
}

export interface Section {
  id: string;
  label: string;
  Preview: React.ComponentType<SectionProps>;
  Full: React.ComponentType<SectionProps>;
}

const SherutimPreview = lazy(() => import('mfe_sherutim/Preview'));
const SherutimFull = lazy(() => import('mfe_sherutim/Full'));
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
