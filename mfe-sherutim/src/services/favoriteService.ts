import type { Sherut } from '../types';
import { MOCK_SHERUTIM } from '../mockData';

const FAVORITE_IDS = ['s1', 's3', 's4', 's6', 's5'];

// In production: fetch('/api/sherutim/favorites')
export async function getFavoriteSherutim(): Promise<Sherut[]> {
  await new Promise(r => setTimeout(r, 300));
  return FAVORITE_IDS
    .map(id => MOCK_SHERUTIM.find(s => s.id === id))
    .filter((s): s is Sherut => s !== undefined);
}
