import type { PersonType } from './person';

export interface SherutMfeConfig {
  remoteUrl: string;
  scope: string;
  module: string;
  objectType: PersonType[] | null;
  selectedActiveTab?: number;
  // Only the data URL for the "more data" / extended tab varies per-sherut.
  extendedTabDataUrl?: string;
}
