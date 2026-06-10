import type { PersonType } from '../types/openService';

export interface MoreDataTab {
  label: string;
  dataUrl: string;
  color?: string;
  order?: number;
  setAsActive?: boolean;
}

export interface SherutMfeConfig {
  remoteUrl: string;
  scope: string;
  module: string;
  objectType: PersonType[] | null;
  selectedActiveTab?: number;
  moreDataTab?: MoreDataTab;
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
    moreDataTab: {
      label: 'מידע נוסף',
      dataUrl: 'https://api-sherut.example.il/GetMoreData?',
      color: '#7B2FBE',
      setAsActive: false,
    },
  };
}

// In production: fetch(`/api/sherutim/${idntSheryut}/validate`)
export async function validateSherutId(idntSheryut: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200));
  return /^\d+$/.test(idntSheryut) && idntSheryut.length > 0;
}
