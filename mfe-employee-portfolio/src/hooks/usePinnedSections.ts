import { useState, useCallback, useEffect } from 'react';
import type { TabData } from '../types';

// The sections that open in a popover and can be pinned open under the data row.
export type PinnableSection = Extract<keyof TabData, 'murchavData' | 'hatrraa' | 'links'>;

const STORAGE_KEY = 'employeePortfolio.pinnedSections';

const readPinned = (): PinnableSection[] => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

// A pin belongs to the user, not to a tab or an employee — it stays open across tab
// switches and is remembered in the browser for the next visit.
export function usePinnedSections() {
  const [pinned, setPinned] = useState<PinnableSection[]>(readPinned);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pinned)); } catch { /* storage חסום — ההעדפה לא תישמר */ }
  }, [pinned]);

  const pin = useCallback((section: PinnableSection) => {
    setPinned(curr => (curr.includes(section) ? curr : [...curr, section]));
  }, []);

  const unpin = useCallback((section: PinnableSection) => {
    setPinned(curr => curr.filter(s => s !== section));
  }, []);

  return { pinned, pin, unpin };
}
