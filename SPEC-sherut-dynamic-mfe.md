# Spec: Dynamic Sherut MFE Loading

## Goal
When a user clicks a sherut card in the SherutimSection, the app navigates to a route
that dynamically federates and loads a dedicated MFE for that sherut — without the shell
knowing the MFE URL at build time. The config is fetched at runtime from a service.

---

## Route

```
/employee-portfolio/tik-asir/sherutim/:idntSheryut?employeeId=<id>
```

The existing EmployeePortfolioLayout (sidebar + content outlet) stays in place.
The sherut MFE fills the full content (right) column.

---

## Data Flow

```
User clicks SherutimCard
        │
        ▼
navigate('/employee-portfolio/tik-asir/sherutim/SHR001?employeeId=E1')
        │
        ▼
SherutDynamicView mounts
  └─ idntSheryut = 'SHR001' (from useParams)
  └─ employeeId  = 'E1'     (from useSearchParams)
        │
        ▼
getSherutMfeConfig('SHR001')           ← sherutimService.ts (mock API, ~300ms delay)
  └─ returns: { remoteUrl, scope, module }
        │
        ▼
loadRemoteModule(remoteUrl, module)    ← dynamicFederation.ts
  1. import(/* @vite-ignore */ remoteUrl)   → loads ESM remoteEntry.js at runtime
  2. container.init({})                     → initialise (no shared scope passed)
  3. factory = await container.get(module) → get module factory
  4. module  = factory()                    → call factory
  5. return  module.default                 → React component
        │
        ▼
<DynamicComponent idntSheryut="SHR001" employeeId="E1" />
  └─ rendered inside the content column of EmployeePortfolioLayout
```

---

## New Files

### 1. `mfe-sherut-exemplat/` — new MFE (port 3005)

```
mfe-sherut-exemplat/
  package.json          react + react-dom only (no shell dependency)
  vite.config.ts        exposes ./App, port 3005, cors: true
  tsconfig.json         copy of mfe-digital-objects tsconfig
  index.html
  src/
    vite-env.d.ts
    index.css
    main.tsx            dev harness — renders App with hard-coded props
    App.tsx             the exposed component
```

**`App.tsx` props interface:**
```ts
interface Props {
  idntSheryut?: string;
  employeeId?: string;
}
```

No shell imports. All data is mock-local, keyed by `idntSheryut`.

---

### 2. `shell/src/services/sherutimService.ts` — new

```ts
interface SherutMfeConfig {
  remoteUrl: string;   // e.g. 'http://localhost:3005/assets/remoteEntry.js'
  scope:     string;   // e.g. 'mfe_sherut_exemplat'
  module:    string;   // e.g. './App'
}

export async function getSherutMfeConfig(idntSheryut: string): Promise<SherutMfeConfig>
```

Mock: 300 ms delay, returns the exemplat MFE config for any id.
In production this is a real API call.

---

### 3. `shell/src/utils/dynamicFederation.ts` — new

```ts
// Caches loaded containers by remoteUrl to avoid duplicate loads
const containers = new Map()

export async function loadRemoteModule(
  remoteUrl: string,
  moduleName: string
): Promise<React.ComponentType<any>>
```

---

### 4. `shell/src/sections/SherutDynamicView.tsx` — new

Route component. Handles loading states and renders the dynamic MFE.

---

## Modified Files

### 5. `shell/src/App.tsx`

Add one child route inside the `/employee-portfolio` layout:

```tsx
<Route
  path="tik-asir/sherutim/:idntSheryut"
  element={<SherutDynamicView />}
/>
```

Place it **before** `:section` so React Router ranks it first.

---

### 6. `shell/src/sections/SherutimSection.tsx`

- Add `idntSheryut` field to `MOCK_SHERUTIM`
- Add `onClick` prop to `SherutimCard`
- Wire both `SherutimPreview` and `SherutimFull` cards to navigate:

```
/employee-portfolio/tik-asir/sherutim/${s.idntSheryut}?employeeId=${employeeId}
```

---

## UI Sketches

### A — SherutimSection cards (no change to look, just adds click)

```
┌─────────────────────────────────────────────────────────┐
│  שירותים דיגיטליים                         [ הצג הכל ]  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  בקשת חופשה  │  │ אישור נסיעות │  │  עדכון פרטים │  │
│  │              │  │              │  │              │  │
│  │  ╔ פתוח ╗   │  │  ╔ ממתין╗   │  │  ╔הושלם╗    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│        ▲ onClick → navigate to tik-asir/sherutim/SHR001  │
└─────────────────────────────────────────────────────────┘
```

---

### B — SherutDynamicView: loading state

```
┌────────────────────────────────────────────────────────────┐
│  EmployeePortfolioLayout                                    │
│  ┌──────────────┐  ┌──────────────────────────────────────┐│
│  │              │  │                                       ││
│  │  Employee    │  │   ⏳ טוען שירות...                    ││
│  │  Portfolio   │  │                                       ││
│  │  MFE         │  │   שלב 1/2: מביא הגדרות               ││
│  │  (sidebar)   │  │   שלב 2/2: טוען מודול                ││
│  │              │  │                                       ││
│  └──────────────┘  └──────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

---

### C — SherutDynamicView: loaded (mfe-sherut-exemplat rendered)

```
┌────────────────────────────────────────────────────────────┐
│  EmployeePortfolioLayout                                    │
│  ┌──────────────┐  ┌──────────────────────────────────────┐│
│  │              │  │  ← חזרה                               ││
│  │  Employee    │  │                                       ││
│  │  Portfolio   │  │  ┌────────────────────────────────┐  ││
│  │  MFE         │  │  │  בקשת חופשה        [ פתוח ]    │  ││
│  │  (sidebar)   │  │  │  ────────────────────────────  │  ││
│  │              │  │  │  תיאור: טופס בקשת חופשה...      │  ││
│  │              │  │  │                                │  ││
│  │              │  │  │  שלבי תהליך:                   │  ││
│  │              │  │  │  ✓ הגשת בקשה                   │  ││
│  │              │  │  │  ✓ אישור מנהל ישיר             │  ││
│  │              │  │  │  ● אישור HR          ← נוכחי   │  ││
│  │              │  │  │  ○ אישור סופי                  │  ││
│  │              │  │  │                                │  ││
│  │              │  │  │  פרטי בקשה:                    │  ││
│  │              │  │  │  תאריך התחלה  │  15/05/2026   │  ││
│  │              │  │  │  תאריך סיום   │  22/05/2026   │  ││
│  │              │  │  │  מספר ימים    │  5             │  ││
│  │              │  │  └────────────────────────────────┘  ││
│  │              │  │                                       ││
│  │              │  │  ┌─ MFE badge ──────────────────┐    ││
│  │              │  │  │ 🔌 נטען דינמית: mfe-sherut-  │    ││
│  │              │  │  │    exemplat @ localhost:3005  │    ││
│  │              │  │  └──────────────────────────────┘    ││
│  └──────────────┘  └──────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

---

### D — mfe-sherut-exemplat App component internals

```
┌──────────────────────────────────────────────────────────┐
│  [title]                              [status badge]      │
│  ─────────────────────────────────────────────────────   │
│  [description text]                                       │
│                                                           │
│  שלבי תהליך                                              │
│  ●──●──◐──○   (timeline dots: done/done/current/pending)  │
│  step1 step2  step3  step4                                │
│                                                           │
│  פרטי הבקשה                                              │
│  ┌──────────────┬───────────────┐                        │
│  │ label        │ value         │  (grid of fields)      │
│  │ label        │ value         │                        │
│  └──────────────┴───────────────┘                        │
│                                                           │
│  ── MFE badge (shows idntSheryut + remoteUrl for debug) ──│
└──────────────────────────────────────────────────────────┘
```

---

## mock data in mfe-sherut-exemplat

| idntSheryut | title                  | steps current |
|-------------|------------------------|---------------|
| SHR001      | בקשת חופשה             | אישור HR (3rd)|
| SHR002      | אישור נסיעות           | אישור מנהל (2nd)|
| SHR003      | עדכון פרטים אישיים     | הושלם (4th)   |
| SHR004      | בקשת ציוד משרדי        | הגשת בקשה (1st)|
| SHR005      | דיווח שעות עבודה       | אישור HR (3rd)|
| (default)   | שירות [id]             | הגשת בקשה (1st)|

---

## Port assignments

| MFE                    | Port |
|------------------------|------|
| shell                  | 3000 |
| mfe-tasks              | 3001 |
| mfe-search-employee    | 3002 |
| mfe-employee-portfolio | 3003 |
| mfe-digital-objects    | 3004 |
| **mfe-sherut-exemplat**| **3005** |

---

## Run instructions (after implementation)

```bash
# Terminal 1 — build + preview the new MFE
cd mfe-sherut-exemplat
npm install
npm run build && npm run preview

# Terminal 2 — rebuild + preview the shell (must rebuild for new route)
cd shell
npm run build && npm run preview

# All other MFEs (terminals 3-6) — already running, no changes needed
```

> Federation requires `vite build` + `vite preview`.
> `vite dev` mode does NOT support module federation with @originjs/vite-plugin-federation.

---

## Open questions before implementation

1. Should `getSherutMfeConfig` map each `idntSheryut` to the same exemplat MFE,
   or should different sherut IDs map to different (mock) remote URLs?
   → Suggest: all map to the same exemplat MFE for now (one MFE proves the pattern).

2. Should the back button do `navigate(-1)` or navigate to
   `/employee-portfolio/sherutim?employeeId=...`?
   → Suggest: `navigate(-1)` to preserve browser history naturally.

3. Should `SherutDynamicView` pass `employeeId` to the MFE component as a prop,
   or is `idntSheryut` enough for the exemplat?
   → Suggest: pass both so the MFE can display "for employee X".
