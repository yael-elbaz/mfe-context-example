# Spec: openService — Shell Navigation API

## Goal

MFEs declare **intent** — what they want to open and why.
Shell owns **routing** — it decides which URL to navigate to.

MFEs never import `useNavigate`, never construct URLs, never know about route structure.

---

## API

```ts
openService(meta: ServiceMeta): void
```

`ServiceMeta` is a plain nested object — no arrays. Any nesting depth is allowed.

```ts
type ServiceMeta = {
  [key: string]: string | number | boolean | ServiceMeta;
};
```

---

## Flattening Algorithm

Before routing, shell flattens `meta` into a single-level map.

### Rules
1. Traverse the object recursively.
2. When a leaf value is reached (not an object), store it by **leaf key name only** — no path prefix.
3. If the same leaf key appears more than once (across different nested paths), collect all its values into an array.

### Example

```ts
// Input:
openService({
  type: 'sherut',
  employee: {
    id: 'E1',
    status: 'active',
  },
  sherut: {
    status: 'pending',        // 'status' appears again
    idntSheryut: 'SHR001',
    mfeUrl: 'http://localhost:3005/assets/remoteEntry.js',
    mfeScope: 'mfe_sherut_exemplat',
    mfeModule: './App',
  },
})

// Flattened:
{
  type:         'sherut',
  id:           'E1',
  status:       ['active', 'pending'],  // duplicate → array
  idntSheryut:  'SHR001',
  mfeUrl:       'http://localhost:3005/assets/remoteEntry.js',
  mfeScope:     'mfe_sherut_exemplat',
  mfeModule:    './App',
}
```

### Flattening function

```ts
// shell/src/services/openService.ts

function flattenMeta(
  obj: ServiceMeta,
  result: Record<string, any> = {}
): Record<string, any> {
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === 'object') {
      flattenMeta(value as ServiceMeta, result);
    } else {
      if (key in result) {
        result[key] = Array.isArray(result[key])
          ? [...result[key], value]
          : [result[key], value];
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}
```

---

## Routing Decision

After flattening, shell reads the flat map and navigates:

```ts
function resolveRoute(flat: Record<string, any>): { url: string; state: Record<string, any> } {
  switch (flat.type) {

    case 'sherut':
      return {
        url: `/employee-portfolio/sherutim/${flat.idntSheryut}?employeeId=${flat.id}`,
        state: {
          mfeConfig: {
            remoteUrl: flat.mfeUrl,
            scope:     flat.mfeScope,
            module:    flat.mfeModule,
          },
        },
      };

    case 'employee':
      return {
        url: `/employee-portfolio?employeeId=${flat.id}`,
        state: {},
      };

    default:
      throw new Error(`openService: unknown type "${flat.type}"`);
  }
}
```

---

## Full Flow

```
MFE calls openService(meta)
        │
        ▼
flattenMeta(meta)           → flat key-value map, duplicates → array
        │
        ▼
resolveRoute(flat)          → { url, state }
        │
        ▼
navigate(url, { state })    → react-router, shell-owned
        │
        ▼
Destination component reads:
  useParams()               → route params
  useSearchParams()         → query params
  useLocation().state       → mfeConfig, extra data
```

---

## Deep Link Guarantee

Every destination component that reads `location.state` MUST handle `state === null`.

```ts
// SherutDynamicView.tsx
const { state } = useLocation();
const mfeConfig = state?.mfeConfig ?? null;

// if mfeConfig is null → fallback to API call:
// getSherutMfeConfig(idntSheryut)
```

---

## MFE Usage

MFEs receive `openService` as a prop. They never construct URLs.

```ts
// mfe-sherutim/src/Preview.tsx
interface Props {
  openService?: (meta: ServiceMeta) => void;
  employeeId?: string;
}

// On card click:
props.openService?.({
  type: 'sherut',
  employee: {
    id: props.employeeId,
  },
  sherut: {
    idntSheryut: 'SHR001',
    mfeUrl:      'http://localhost:3005/assets/remoteEntry.js',
    mfeScope:    'mfe_sherut_exemplat',
    mfeModule:   './App',
  },
});
```

---

## Shell Implementation

`openService` is defined inside `RouterApp` (inside `<BrowserRouter>`) so it has access to `useNavigate`:

```ts
// shell/src/App.tsx
const RouterApp: React.FC = () => {
  const navigate = useNavigate();

  const openService = (meta: ServiceMeta) => {
    const flat = flattenMeta(meta);
    const { url, state } = resolveRoute(flat);
    navigate(url, { state });
  };

  return (
    <>
      <Routes>
        <Route path="/" element={
          <>
            {mfe('...', SearchEmployeeMFE, { openService })}
            {mfe('...', TasksMFE, { openService })}
          </>
        } />
        <Route path="/employee-portfolio" element={<EmployeePortfolioLayout openService={openService} />}>
          <Route index element={<EmployeePortfolioIndex openService={openService} />} />
          <Route path="sherutim/:idntSheryut" element={<SherutDynamicView />} />
          <Route path=":section" element={<SectionFullView openService={openService} />} />
        </Route>
      </Routes>
    </>
  );
};
```

---

## Shared Type (exposed via Module Federation)

```ts
// shell/src/types/openService.ts

export type ServiceMeta = {
  [key: string]: string | number | boolean | ServiceMeta;
};

export type OpenService = (meta: ServiceMeta) => void;
```

Shell exposes it so MFEs can type their props correctly:

```ts
// shell/vite.config.ts
exposes: {
  './store':       './src/store/appContext.ts',
  './employeeStore': './src/store/employeeStore.ts',
  './openService': './src/types/openService.ts',   // type only
}
```

MFE import:
```ts
import type { OpenService, ServiceMeta } from 'shell/openService';
```

---

## Files

| File | Change |
|------|--------|
| `shell/src/types/openService.ts` | **New** — `ServiceMeta` + `OpenService` types |
| `shell/src/services/openService.ts` | **New** — `flattenMeta` + `resolveRoute` |
| `shell/src/App.tsx` | Extract `RouterApp`, define `openService`, pass as prop |
| `shell/vite.config.ts` | Expose `'./openService'` |
| `shell/src/remotes.d.ts` | Add `declare module 'shell/openService'` |
| `shell/src/sections/SherutDynamicView.tsx` | Read `location.state.mfeConfig`, fallback to API |
| `mfe-tasks/src/App.tsx` | Accept `openService` prop |
| `mfe-search-employee/src/App.tsx` | Accept `openService` prop |
| `mfe-employee-portfolio/src/App.tsx` | Accept `openService` prop, replace `window.dispatchEvent` |
| `mfe-sherutim/src/Preview.tsx` | **New MFE** — calls `openService` on card click |
| `mfe-sherutim/src/Full.tsx` | **New MFE** — calls `openService` on card click |

---

## What openService does NOT do

- Does not know which MFE will render the destination — that is the destination route's concern
- Does not validate metadata fields beyond `type` — unknown fields are passed through in `state`
- Does not handle external URLs
- Does not replace the fallback API call for deep links — that remains in `SherutDynamicView`
