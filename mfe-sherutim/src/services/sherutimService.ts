import type { SherutimItem } from '../types';
import { SHERUTIM_ITEMS } from '../mockData';

// יחידת עבודה נבחרת — מגיעה מ-appContext של ה-shell (structurally-compatible).
export interface WorkUnit {
  id: string;
  name: string;
  department: string;
}

// כל פריטי השירותים (קטגוריות + שירותים) עבור היחידה הנבחרת.
// In production: fetch(`/api/sherutim?unit=${unit.id}`)
export async function getSherutimItems(unit: WorkUnit): Promise<SherutimItem[]> {
  await new Promise(r => setTimeout(r, 300));
  // בהדגמה הנתונים זהים לכל יחידה; בפרודקשן הרשימה תלויה ב-unit.
  console.debug('[sherutim] fetching items for unit', unit.id);
  return SHERUTIM_ITEMS;
}
