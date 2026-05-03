# Spec: Sherutim MFE Config — Navigation State Cache

## Goal

When the user navigates from `SherutimSection` → `SherutDynamicView`, the mfeConfig
travels with the navigation via `location.state` — no second API call.  
When the user lands on a deep URL directly (or refreshes), `SherutDynamicView` falls
back to fetching the config from the service.

`mfe-sherutim` owns its data — it fetches the sherutim list, caches it internally,
and passes mfeConfig forward through navigation state.  
The shell does not own or cache any sherutim data.

---

## Responsibility split

| Layer | Owns |
|---|---|
| `mfe-sherutim` | fetch sherutim list, internal cache, render cards, navigate with mfeConfig in state |
| shell navigation | carries mfeConfig from card click to detail view via `location.state` |
| `SherutDynamicView` (shell) | reads `location.state.mfeConfig` if present, falls back to `getSherutMfeConfig()` |

---

## Data Flow

### A — Normal navigation (list → detail)

```
mfe-sherutim mounts
  └─ fetches sherutim list from API (owns this, internal state)
  └─ each Sherut item includes mfeConfig: { remoteUrl, scope, module }

User clicks SherutimCard
  └─ navigate(
       '/employee-portfolio/tik-asir/sherutim/SHR001?employeeId=E1',
       { state: { mfeConfig: { remoteUrl, scope, module } } }
     )

SherutDynamicView mounts
  └─ location.state.mfeConfig → FOUND
  └─ setPhase('module')                  ← skips phase 'config' entirely
  └─ loadRemoteModule(remoteUrl, module)
  └─ render <DynamicComponent />
```

### B — Deep URL or page refresh (no navigation state)

```
User lands on /employee-portfolio/tik-asir/sherutim/SHR001?employeeId=E1 directly

SherutDynamicView mounts
  └─ location.state?.mfeConfig → undefined
  └─ setPhase('config')
  └─ getSherutMfeConfig('SHR001')        ← sherutimService.ts fallback (~300ms)
  └─ setPhase('module')
  └─ loadRemoteModule(remoteUrl, module)
  └─ render <DynamicComponent />
```

---

## Types

Defined in `shell/src/services/sherutimService.ts` (shell-side API boundary):

```ts
interface SherutMfeConfig {
  remoteUrl: string;   // e.g. 'http://localhost:3005/assets/remoteEntry.js'
  scope:     string;   // e.g. 'mfe_sherut_exemplat'
  module:    string;   // e.g. './App'
}
```

`mfe-sherutim` defines its own internal `Sherut` type (with embedded `mfeConfig`) —
it does not share types with the shell.

---

## Files

### 1. `shell/src/services/sherutimService.ts`  — no change needed

`getSherutMfeConfig(idntSheryut)` stays as the deep-URL fallback. No new functions needed in the shell.

---

### 2. `shell/src/sections/SherutDynamicView.tsx`  — MODIFY

Read `location.state` instead of the store:

```ts
import { useLocation } from 'react-router-dom';
import type { SherutMfeConfig } from '../services/sherutimService';

const location = useLocation();

useEffect(() => {
  if (!idntSheryut) return;
  let cancelled = false;

  (async () => {
    try {
      const cached = (location.state as { mfeConfig?: SherutMfeConfig } | null)?.mfeConfig;

      let mfeConfig: SherutMfeConfig;
      if (cached) {
        mfeConfig = cached;
        setPhase('module');                          // skip phase 'config'
      } else {
        setPhase('config');
        mfeConfig = await getSherutMfeConfig(idntSheryut);   // deep-URL fallback
        if (cancelled) return;
        setPhase('module');
      }

      const Component = await loadRemoteModule(mfeConfig.remoteUrl, mfeConfig.module);
      if (cancelled) return;
      setDynamicComponent(() => Component);
      setPhase('done');
    } catch (err) {
      if (!cancelled) { setError((err as Error).message); setPhase('error'); }
    }
  })();

  return () => { cancelled = true; };
}, [idntSheryut]);
```

The loading UI (`Dot` steps) starts at phase `'module'` when config is cached —
first dot renders as `done` immediately.

---

### 3. `shell/src/sections/SherutimSection.tsx`  — REMOVE (future)

Once `mfe-sherutim` is built, `SherutimSection.tsx` is deleted from the shell.  
Until then it stays as-is (using local `MOCK_SHERUTIM`) with a note that it is a placeholder.

---

### 4. `mfe-sherutim` (future MFE)  — NEW

Internal concerns only — no shell store, no registry:

```ts
// internal to mfe-sherutim
interface Sherut {
  id:          string;
  idntSheryut: string;
  title:       string;
  status:      string;
  mfeConfig:   { remoteUrl: string; scope: string; module: string };
}

// on card click:
navigate(
  `/employee-portfolio/tik-asir/sherutim/${s.idntSheryut}?employeeId=${employeeId}`,
  { state: { mfeConfig: s.mfeConfig } }
);
```

Internal caching strategy (e.g. useState, zustand, react-query) is entirely up
to `mfe-sherutim` — the shell does not care.

---

## What we intentionally avoid

| Pattern | Why not |
|---|---|
| Zustand store in shell for sherutim list | shell should not own mfe-sherutim's data |
| Registry in shell with setter exposed via federation | MFE writing into shell internals — backwards ownership |
| Registry in mfe-sherutim exposed to shell | shell importing from MFE — circular dependency |

---

## Port assignments (unchanged)

| MFE                    | Port |
|------------------------|------|
| shell                  | 3000 |
| mfe-tasks              | 3001 |
| mfe-search-employee    | 3002 |
| mfe-employee-portfolio | 3003 |
| mfe-digital-objects    | 3004 |
| mfe-sherut-exemplat    | 3005 |
