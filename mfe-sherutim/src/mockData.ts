import type { Sherut } from './types';

const EXEMPLAT_MFE = {
  mfeUrl:    'http://localhost:3005/assets/remoteEntry.js',
  mfeScope:  'mfe_sherut_exemplat',
  mfeModule: './App',
};

export const MOCK_SHERUTIM: Sherut[] = [
  { id: 's1', idntSheryut: 'SHR001', title: 'בקשת חופשה',           status: 'פתוח',  ...EXEMPLAT_MFE },
  { id: 's2', idntSheryut: 'SHR002', title: 'אישור נסיעות',          status: 'ממתין', ...EXEMPLAT_MFE },
  { id: 's3', idntSheryut: 'SHR003', title: 'עדכון פרטים אישיים',    status: 'הושלם', ...EXEMPLAT_MFE },
  { id: 's4', idntSheryut: 'SHR004', title: 'בקשת ציוד משרדי',       status: 'פתוח',  ...EXEMPLAT_MFE },
  { id: 's5', idntSheryut: 'SHR005', title: 'דיווח שעות עבודה',      status: 'ממתין', ...EXEMPLAT_MFE },
];
