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
  └─ no employee → pendingFlat.current = flat
                   setShowSelectPopup(true)
                        │
                        ▼
               <SelectEmployeePopup>  (modal overlay, rendered in RouterApp)
                    │
                    └─ <SearchEmployeeMFE onSelected={onEmployeeSelect} />
                              │
                              ▼ user picks employee
                    onEmployeeSelect(idntEmployee)
                      ├─ setShowSelectPopup(false)
                      └─ navToServcie(pendingFlat, idntEmployee)
                              │
                              ▼
                    resolveRoute(flat)  → { url, state, openType }
                    withEmployeeId(url, idntEmployee)  ← appended here
                    navigate(finalUrl, { state })
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

## Files changed

### 1. `shell/src/hooks/useOpenService.ts`

New state and refs:
```ts
const [showSelectPopup, setShowSelectPopup] = useState(false);
const pendingFlat = useRef<DigitalService | null>(null);  // useRef — no re-render needed
```

`navToServcie` signature:
```ts
async (flat: DigitalService, employeeId?: string) => void
// employeeId appended to internal URLs before navigate()
```

`openService` change:
```ts
// before: navigate('/select-employee', { state: { pendingSherut: flat } })
// after:
pendingFlat.current = flat;
setShowSelectPopup(true);
```

Two new callbacks returned:
```ts
onEmployeeSelect(idntEmployee: string)
  // close popup + navToServcie(pendingFlat, idntEmployee)

onCloseSelectPopup()
  // close popup + clear pendingFlat
```

Returns:
```ts
{ openService, navToServcie, showSelectPopup, onEmployeeSelect, onCloseSelectPopup }
```

---

### 2. `shell/src/components/SelectEmployeePopup.tsx` (new)

Modal overlay — renders the SearchEmployee MFE with an `onSelected` prop.

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
- Click on backdrop → `onClose()`
- Click inside panel → `stopPropagation`
- ESC key → `onClose()`
- Employee selected → `onSelected(idntEmployee)` (popup does NOT close itself — the hook does)

---

### 3. `shell/src/App.tsx` — RouterApp

Add popup rendering alongside routes:

```tsx
const { openService, navToServcie, showSelectPopup, onEmployeeSelect, onCloseSelectPopup } = useOpenService();

return (
  <>
    <Header />
    <main>
      <Routes>...</Routes>
    </main>

    {showSelectPopup && (
      <SelectEmployeePopup
        onSelected={onEmployeeSelect}
        onClose={onCloseSelectPopup}
      />
    )}
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

1. Should the popup show a "loading" banner that names the pending service
   (e.g., "בחר עובד לפתיחת: בקשת חופשה")?
   → The `pendingFlat.textMenu` / `textMenuItem` can be passed as a prop for this.

2. Should selecting an employee also update the Zustand `employeeStore`
   so the sidebar profile loads immediately?
   → Suggested: yes — call `useEmployeeStore.getState().setEmployee(...)` in `onEmployeeSelect`
     after setting the employee ID (requires a `setEmployee` action in the store).
