import type { DigitalService } from '../types/openService';

type Trigger = (flat: DigitalService) => void;
let _trigger: Trigger | null = null;
let _resolve: ((id: string | null) => void) | null = null;

export const registerSelectEmployeeGate = (fn: Trigger) => { _trigger = fn; };

export const waitForEmployeeSelect = (flat: DigitalService): Promise<string | null> =>
  new Promise(resolve => {
    _resolve = resolve;
    _trigger?.(flat);
  });

export const resolveEmployeeSelect = (id: string | null) => {
  _resolve?.(id);
  _resolve = null;
};
