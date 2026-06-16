import type React from 'react';

interface RemoteContainer {
  get: (module: string) => Promise<() => { default: React.ComponentType<any> }>;
  init: (shareScope: unknown) => Promise<void>;
}

// Cache by remoteUrl so the same remote entry is only loaded once
const containers = new Map<string, Promise<RemoteContainer>>();

function loadRemoteContainer(remoteUrl: string, scope: string): Promise<RemoteContainer> {
  let containerPromise = containers.get(remoteUrl);
  if (!containerPromise) {
    containerPromise = new Promise<RemoteContainer>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = remoteUrl;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        const container = (window as any)[scope] as RemoteContainer | undefined;
        if (!container) {
          reject(new Error(`Remote container "${scope}" not found after loading ${remoteUrl}`));
          return;
        }
        resolve(container);
      };
      script.onerror = () => {
        reject(new Error(`Failed to load remote entry ${remoteUrl}`));
      };
      document.head.appendChild(script);
    });
    containers.set(remoteUrl, containerPromise);
  }
  return containerPromise;
}

export async function loadRemoteModule(
  remoteUrl: string,
  moduleName: string,
  scope: string,
): Promise<React.ComponentType<any>> {
  await __webpack_init_sharing__('default');
  const container = await loadRemoteContainer(remoteUrl, scope);
  try {
    await container.init(__webpack_share_scopes__.default);
  } catch (_) {
    // already initialised — safe to ignore
  }
  const factory = await container.get(moduleName);
  return factory().default;
}
