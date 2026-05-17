# Spec: Employee Picker Popup (Promise-based)

## Problem

`openService` currently handles the "no employee" case by navigating to `/select-employee`,
passing the pending `DigitalService` as router state. This loses the original call context
and requires `SelectEmployeePage` to receive `navToServcie` as a prop to resume after
selection — a brittle coupling between routing and business logic.

---

## Current Flow (replaced)

```
openService(meta)
  └─ no employee in store
       └─ navigate('/select-employee', { state: { pendingSherut: flat } })
            └─ SelectEmployeePage renders SearchEmployeeMFE
                 └─ onSelected(idntEmployee)
                      └─ if pendingSherut && navToServcie → navToServcie(pendingSherut)
                         else → navigate('/employee-portfolio?employeeId=...')
```

Problems:
- `navToServcie` must be prop-drilled through the router to `SelectEmployeePage`
- Functions cannot be passed as navigation state (structured clone limitation)
- Full page navigation loses the user's current context

---

## New Flow (Promise-based popup)

```
openService(meta)
  └─ no employee in store
       └─ const idntEmployee = await waitForEmployee()
                 │
                 ▼  (popup renders over current page)
            <EmployeePickerPopup>
               └─ <SearchEmployeeMFE onSelected={...} />
                        │
                        ▼  user picks → Promise resolves with idntEmployee
                           user closes → Promise resolves with null
       └─ if null → abort (do nothing, stay on current page)
       └─ navToServcie(flat)    ← resumes exactly where it stopped
```

---

## Components

### `useEmployeePickerPopup` hook

**Location:** `shell/src/hooks/useEmployeePickerPopup.ts`

Owns all popup state. Provides:
- `waitForEmployee(): Promise<string | null>` — called by `openService`; opens the popup
  and returns a Promise that resolves when the user picks or dismisses
- `pickerProps` — passed directly to `<EmployeePickerPopup>`

**Internals:**
```ts
const pendingResolve = useRef<((id: string | null) => void) | null>(null);
const [open, setOpen] = useState(false);

function waitForEmployee(): Promise<string | null> {
  setOpen(true);
  return new Promise((resolve) => {
    pendingResolve.current = resolve;
  });
}

function onSelected(idntEmployee: string) {
  pendingResolve.current?.(idntEmployee);
  pendingResolve.current = null;
  setOpen(false);
}

function onClose() {
  pendingResolve.current?.(null);
  pendingResolve.current = null;
  setOpen(false);
}
```

**Return type:**
```ts
interface UseEmployeePickerPopupReturn {
  waitForEmployee: () => Promise<string | null>;
  pickerProps: {
    open: boolean;
    onSelected: (idntEmployee: string) => void;
    onClose: () => void;
  };
}
```

---

### `EmployeePickerPopup` component

**Location:** `shell/src/components/EmployeePickerPopup.tsx`

Modal overlay with a single field — employee search (via `SearchEmployeeMFE`).

```
┌──────────────────────────────────────────────────────────┐
│  backdrop (semi-transparent, click → onClose)             │
│                                                           │
│   ┌───────────────────────────────────────────────────┐  │
│   │                                              [✕]  │  │
│   │  בחר עובד לפתיחת השירות                           │  │
│   │  ─────────────────────────────────────────────    │  │
│   │  <SearchEmployeeMFE onSelected={onSelected} />    │  │
│   └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

Props:
```ts
interface Props {
  open: boolean;
  onSelected: (idntEmployee: string) => void;
  onClose: () => void;
}
```

Behaviour:
- Renders `null` when `open === false` (no DOM cost)
- Click backdrop → `onClose()`
- Click panel → `stopPropagation`
- ESC key → `onClose()`
- Employee selected in MFE → `onSelected(idntEmployee)`

---

## `useOpenService` changes

`waitForEmployee` is passed in as a parameter (from `App.tsx`):

```ts
export const useOpenService = (
  waitForEmployee: () => Promise<string | null>
) => {
  const openService = useCallback((meta: Service) => {
    const flat = flattenMeta(meta);
    const currentEmployee = useEmployeeStore.getState().employee;

    if (!currentEmployee) {
      waitForEmployee().then((idntEmployee) => {
        if (idntEmployee == null) return;   // user dismissed — abort
        navToServcie(flat);
      });
      return;
    }

    navToServcie(flat);
  }, [navigate, waitForEmployee]);
  // ...
};
```

`navToServcie` is unchanged.

---

## Mount point — `App.tsx`

The popup is rendered **once at the app root**, above all routes, so it appears regardless
of the current route.

```tsx
const { waitForEmployee, pickerProps } = useEmployeePickerPopup();
const { openService, navToServcie }    = useOpenService(waitForEmployee);

return (
  <>
    <Header />
    <main>
      <Routes>...</Routes>
    </main>
    <EmployeePickerPopup {...pickerProps} />
  </>
);
```

---

## Files changed

| File | Change |
|------|--------|
| `shell/src/hooks/useEmployeePickerPopup.ts` | **New** — Promise-based popup hook |
| `shell/src/components/EmployeePickerPopup.tsx` | **New** — modal with `SearchEmployeeMFE` |
| `shell/src/hooks/useOpenService.ts` | Accept `waitForEmployee` param; replace `navigate('/select-employee')` with `await waitForEmployee()` |
| `shell/src/App.tsx` | Instantiate hook, render `<EmployeePickerPopup>`, pass `waitForEmployee` to `useOpenService` |
| `shell/src/components/SelectEmployeePage.tsx` | Remove `navToServcie` prop (no longer needed) |

---

## What Does NOT Change

- `resolveRoute`, `flattenMeta`, `openInBlank` — untouched
- `/select-employee` route — can stay as a standalone fallback page; `openService` just no
  longer navigates to it
- `SearchEmployeeMFE` — already accepts `onSelected` prop, no changes needed
- Zustand stores — employee store is still set externally; this hook only reads from it
