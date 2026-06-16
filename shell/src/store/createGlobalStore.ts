import { create, type StateCreator } from 'zustand';

/**
 * Module Federation loads "exposed" modules once per consuming runtime
 * (the shell itself plus every remote that imports from `shell/...`), so a
 * plain `create(...)` call would produce a separate store instance per
 * runtime. This wrapper stashes the first instance on `window` so every
 * runtime that calls it for the same key shares one true singleton store.
 */
export function createGlobalStore<T>(key: string, initializer: StateCreator<T>) {
  const globalScope = window as unknown as Record<string, unknown>;
  return (globalScope[key] ??= create<T>(initializer)) as ReturnType<typeof create<T>>;
}
