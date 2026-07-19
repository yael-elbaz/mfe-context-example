import type { SherutimItem } from '../types';
import { SHERUTIM_ITEMS } from '../mockData';

// כל פריטי השירותים הגלובליים (קטגוריות + שירותים) ברשימה מעורבת אחת.
// In production: fetch('/api/sherutim')
export async function getSherutimItems(): Promise<SherutimItem[]> {
  await new Promise(r => setTimeout(r, 300));
  return SHERUTIM_ITEMS;
}
