# Spec: Select Employee Popup

## Goal
Replace the navigate-to-page flow for missing employee with an inline popup that renders
the SearchEmployee MFE. On selection the popup closes and the pending service opens
with the selected employee's ID in the URL search params.

---

## Current flow (replaced)

```
openService(meta)
  └─ no employee → navigate('/select-employee', { state: { pendingSherut } })
       └─ SelectEmployeePage mounts → user searches → onSelected → navToServcie(flat)
                                                               ↑ employeeId never in URL
```

Problems:
- Full page navigation loses the user's context
- `employeeId` is never injected into the final sherut URL — the layout can't load the profile

---

## New flow

```
openService(meta)
  └─ no employee → id = await waitForEmployeeSelect(flat)  ← pauses here
                        │
                        ▼
           <SelectEmployeeGate>  (self-contained, placed once in RouterApp)
                receives trigger via module signal
                shows <SelectEmployeePopup />
                    │
                    └─ <SearchEmployeeMFE onSelected={...} />
                                │
                                ▼ user picks employee
                    resolveEmployeeSelect(idntEmployee)
                                │
                        ◀───────┘  Promise resolves
  └─ id = idntEmployee
  └─ navToServcie(flat, id)
          │
          ▼
  resolveRoute(flat) → { url, state, openType }
  withEmployeeId(url, id)
  navigate(finalUrl, { state })
```

---

## Architecture: Promise + module-level signal

Two concerns are separated cleanly:

**1. Async gate** — `openService` awaits the employee selection as a Promise.
   The flow inside the hook reads linearly; all "what happens after" stays in one place.

**2. Rendering** — a module-level signal bridges the trigger to `SelectEmployeeGate`
   without prop drilling. No Zustand, no Context, no popup state lifted to `App.tsx`.

```ts
// selectEmployeeSignal.ts
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
```

---

## Where employeeId goes into the URL

`navToServcie` receives an optional `employeeId` argument. After `resolveRoute` returns
the URL, a small helper appends `?employeeId=X` (or `&employeeId=X`) before navigating.

```
resolveRoute → url = '/employee-portfolio/sherutim/SHR001?mfeConfig=...'
withEmployeeId  → '/employee-portfolio/sherutim/SHR001?mfeConfig=...&employeeId=1003'
```

This is the correct layer because:
- `resolveRoute` stays focused on sherut/MFE config (no employee context)
- The route components (`SherutDynamicView`, `EmployeePortfolioLayout`) read `employeeId`
  from `useSearchParams()` — the URL is their source of truth
- `blank` links skip `withEmployeeId` entirely (external URL, no layout needed)

---

## Files

### 1. `shell/src/services/selectEmployeeSignal.ts` (new)

Module-level signal + Promise bridge. See architecture section above.

### 2. `shell/src/hooks/useOpenService.ts`

`openService` becomes async and awaits the employee selection:

```ts
const openService = useCallback(async (meta: Service) => {
  const flat = flattenMeta(meta) as DigitalService;

  const currentEmployee = useEmployeeStore.getState().employee;
  if (!currentEmployee) {
    const id = await waitForEmployeeSelect(flat);
    if (!id) return; // user cancelled
    navToServcie(flat, id);
    return;
  }
  navToServcie(flat);
}, [navToServcie]);
```

`navToServcie` signature:
```ts
async (flat: DigitalService, employeeId?: string) => void
// employeeId appended to internal URLs before navigate()
```

Returns (no popup-related values):
```ts
{ openService, navToServcie }
```

### 3. `shell/src/components/SelectEmployeeGate.tsx` (new)

Self-contained. Registers itself via the signal on mount. Owns only the `pending` state
needed to show/hide the popup. Has NO knowledge of `navToServcie` or service logic.

```tsx
const SelectEmployeeGate: React.FC = () => {
  const [pending, setPending] = useState<DigitalService | null>(null);

  useEffect(() => {
    registerSelectEmployeeGate(setPending);
  }, []);

  if (!pending) return null;

  return (
    <SelectEmployeePopup
      onSelected={(id) => { setPending(null); resolveEmployeeSelect(id); }}
      onClose={() => { setPending(null); resolveEmployeeSelect(null); }}
    />
  );
};
```

### 4. `shell/src/components/SelectEmployeePopup.tsx`

Pure presentational modal overlay — renders the SearchEmployee MFE.

```
┌─────────────────────────────────────────────────────────┐
│  backdrop (rgba overlay, click to close)                 │
│                                                          │
│   ┌──────────────────────────────────────────────────┐  │
│   │  [✕]                                             │  │
│   │                                                  │  │
│   │  בחר עובד לפתיחת השירות                          │  │
│   │  ────────────────────────────────────────────    │  │
│   │  🔍 חיפוש עובד                                   │  │
│   │  ┌────────────────────────────────────────────┐  │  │
│   │  │ הכנס מספר עובד או שם...                    │  │  │
│   │  └────────────────────────────────────────────┘  │  │
│   │  (autocomplete dropdown on type)                 │  │
│   │                                                  │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

Props:
```ts
interface Props {
  onSelected: (idntEmployee: string) => void;
  onClose: () => void;
}
```

Behaviour:
- Click backdrop → `onClose()`
- Click inside panel → `stopPropagation`
- ESC key → `onClose()`
- Employee selected → `onSelected(idntEmployee)`

### 5. `shell/src/App.tsx` — RouterApp

```tsx
const { openService, navToServcie } = useOpenService();

return (
  <>
    <Header />
    <main>
      <Routes>...</Routes>
    </main>
    <SelectEmployeeGate />
  </>
);
```

---

## What does NOT change

- `resolveRoute` — no employee awareness, stays synchronous after initial async for blank
- `SelectEmployeePage` — still exists as a standalone page route (`/select-employee`) as
  fallback; no changes needed
- `SearchEmployeeMFE` — already has `onSelected` prop, no changes needed
- `openInBlank` / `openService` service files — no changes

---

## Open questions

1. Should the popup show the pending service name (e.g., "בחר עובד לפתיחת: בקשת חופשה")?
   → `pending.textMenu` / `textMenuItem` can be passed as a prop to `SelectEmployeePopup`.

2. Should selecting an employee also update the Zustand `employeeStore`
   so the sidebar profile loads immediately?
   → Suggested: yes — call `useEmployeeStore.getState().setEmployee(...)` inside
     `onSelected` in `SelectEmployeeGate` (requires a `setEmployee` action in the store).
