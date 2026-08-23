import type { Sherut } from '../types';
import { MOCK_SHERUTIM } from '../mockData';

// מצב "שרת" מדומה — נשמר לאורך הסשן כדי שבחירות המועדפים ישתקפו גם בטעינות חוזרות.
const favoriteIds = new Set<string>(['s1', 's3', 's4', 's6', 's5']);

// In production: fetch('/api/sherutim/favorites')
export async function getFavoriteSherutim(): Promise<Sherut[]> {
  await new Promise(r => setTimeout(r, 300));
  return [...favoriteIds]
    .map(id => MOCK_SHERUTIM.find(s => s.id === id))
    .filter((s): s is Sherut => s !== undefined);
}

// In production: POST /api/sherutim/favorites  { id }
export async function addFavorite(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
  favoriteIds.add(id);
}

// In production: DELETE /api/sherutim/favorites/{id}
export async function removeFavorite(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
  favoriteIds.delete(id);
}
