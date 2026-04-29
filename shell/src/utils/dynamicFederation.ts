import type React from 'react';

interface RemoteContainer {
  get: (module: string) => Promise<() => { default: React.ComponentType<any> }>;
  init: (shareScope: Record<string, unknown>) => Promise<void>;
}

// Cache by remoteUrl so the same remote entry is only fetched once
const containers = new Map<string, RemoteContainer>();

export async function loadRemoteModule(
  remoteUrl: string,
  moduleName: string,
): Promise<React.ComponentType<any>> {
  if (!containers.has(remoteUrl)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — runtime URL, intentionally dynamic
    const container = (await import(/* @vite-ignore */ remoteUrl)) as RemoteContainer;
    try {
      await container.init({});
    } catch (_) {
      // already initialised, or no shared scope required — safe to ignore
    }
    containers.set(remoteUrl, container);
  }

  const container = containers.get(remoteUrl)!;
  const factory = await container.get(moduleName);
  return factory().default;
}
