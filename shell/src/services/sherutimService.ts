import type { PersonType } from '../types/openService';

export interface SherutMfeConfig {
  remoteUrl: string;
  scope: string;
  module: string;
  objectType: PersonType[] | null;
  selectedActiveTab?: number;
  // Only the data URL for the "more data" tab varies per-sherut; the tab's label,
  // color and active behavior are fixed constants inside mfe-employee-portfolio.
  extendedTabDataUrl?: string;
}

// In production this would be a real API call:
// fetch(`/api/sherutim/${idntSheryut}/mfe-config`)
export async function getSherutMfeConfig(_idntSheryut: string): Promise<SherutMfeConfig> {
  await new Promise(r => setTimeout(r, 300));
  return {
    remoteUrl: 'http://localhost:3005/assets/remoteEntry.js',
    scope: 'mfe_sherut_exemplat',
    module: './App',
    objectType: ['employee'],
    extendedTabDataUrl: 'https://api-sherut.example.il/GetMoreData?',
  };
}

// In production: fetch(`/api/sherutim/${idntSheryut}/validate`)
export async function validateSherutId(idntSheryut: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200));
  return /^\d+$/.test(idntSheryut) && idntSheryut.length > 0;
}
