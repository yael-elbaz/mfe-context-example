# Spec: Person Store Architecture — mfe-search-person

## Problem

The current system is hard-coded for employees only:
- `mfe-search-employee` calls `onSelected(id: string)` — no type info
- `employeeStore` holds `employee: EmployeeProfile | null` — no concept of person type
- Shell always navigates to `/employee-portfolio` — customers have no path
- Adding a customer flow would require a parallel store, a separate search MFE, and duplicated routing

---

## Solution Overview

One store. Each entity carries its own `type` discriminant. Per-type hooks let each consumer
receive an exactly-typed object without knowing about other person types.

---

## 1. Entity Interfaces — discriminant on the entity, not a wrapper

```typescript
interface EmployeeProfile {
  type: 'employee';       // ← discriminant lives here
  id: string;
  firstName: string;
  lastName: string;
  yearsInCompany: number;
  unit: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  image: string;
  skills: string[];
}

interface CustomerProfile {
  type: 'customer';       // ← discriminant lives here
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  memberSince: string;
}
```

**Why discriminant on the entity (not `{ type, data }` wrapper):**
- Access `person.firstName` directly — no `.data` unwrapping
- TypeScript narrows automatically after `if (person.type === 'employee')`
- Adding a future type (e.g. `MishtameshProfile { type: 'mishtamesh'; ... }`) is just a new interface

---

## 2. Single Store — `useSelectedPersonStore`

```typescript
// shell/src/store/personStore.ts

type AnyPerson = EmployeeProfile | CustomerProfile; // add new types here

interface SelectedPersonStore {
  person: AnyPerson | null;
  setSelectedPerson: (person: AnyPerson) => void;
  clearSelectedPerson: () => void;
}

export const useSelectedPersonStore = create<SelectedPersonStore>((set) => ({
  person: null,
  setSelectedPerson: (person) => set({ person }),
  clearSelectedPerson: () => set({ person: null }),
}));
```

`loading` is **not** in this store — it belongs to the layout component that fetches the data
(e.g. `EmployeePortfolioLayout` has its own local `useState<boolean>(false)`).

---

## 3. Per-Type Hooks — exact types, no casting in consumers

```typescript
// Generic — for code that handles any person (e.g. openService, header display)
export const useSelectedPerson = () => useSelectedPersonStore((s) => s.person);
export const useSelectedPersonType = () => useSelectedPersonStore((s) => s.person?.type ?? null);

// Type-narrowed — for consumers that care about a specific type
export const useCurrentEmployee = () => {
  const person = useSelectedPersonStore((s) => s.person);
  if (person?.type !== 'employee') return null;
  return person; // TypeScript: EmployeeProfile
};

export const useCurrentCustomer = () => {
  const person = useSelectedPersonStore((s) => s.person);
  if (person?.type !== 'customer') return null;
  return person; // TypeScript: CustomerProfile
};
```

### Consumer perspective

```typescript
// mfe-employee-portfolio — doesn't know the store changed, nothing changes here
const employee = useCurrentEmployee(); // EmployeeProfile | null

// openService — checks type to pick the right URL param
const { person } = useSelectedPersonStore();
person?.type  // 'employee' | 'customer' | null
```

---

## 4. Backward Compatibility — `shell/employeeStore`

`mfe-employee-portfolio` imports from `shell/employeeStore` today and must keep working.
The `EmployeeProfile` type now has an extra `type: 'employee'` field — templates that don't
read `employee.type` are unaffected.

```typescript
// shell/src/store/employeeStore.ts  ← exposed at the same federation path
export type { EmployeeProfile } from './personStore';
export { useCurrentEmployee as useEmployee } from './personStore';

// useEmployeeLoading stays local in EmployeePortfolioLayout (useState) — not from store
```

`mfe-employee-portfolio/src/App.tsx` requires **zero changes**.

---

## 5. mfe-search-person (renamed from mfe-search-employee)

**Federation key:** `mfe_search_employee` — kept to avoid rebuilding all consumers.

### Updated Props

```typescript
interface Props {
  onSelected?: (id: string, personType: 'employee' | 'customer') => void;
  objectType?: ('employee' | 'customer')[] | null; // filter visible types; null = show all
}
```

### Search Result UI — mixed list, one input, type badge per row

```
┌──────────────────────────────────────────────┐
│ 🔍 חיפוש אדם (עובד / לקוח)                   │
│ ┌──────────────────────────────────────────┐ │
│ │ הכנס שם או מספר...                       │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│  [עובד]  דנה לוי            1001 · כספים    │
│  [לקוח]  משה ישראלי         C001 · תל אביב  │
│  [עובד]  יוסי כהן           1002 · HR       │
└──────────────────────────────────────────────┘
```

- Results are filtered by `objectType` prop when provided
- Clicking a row calls `onSelected(id, personType)`

---

## 6. Shell Navigation Flow

### `SelectPersonPage` (was `SelectEmployeePage`)

```typescript
const onSelected = (id: string, personType: 'employee' | 'customer') => {
  if (personType === 'employee') navigate(`/employee-portfolio?employeeId=${id}`);
  if (personType === 'customer') navigate(`/customer-portfolio?customerId=${id}`);
};
```

### `EmployeePortfolioLayout` (updated)

- Reads `employeeId` from URL
- Fetches data, calls `setSelectedPerson({ type: 'employee', ...data })`
- Local `useState` for loading (not the store)
- Clears on unmount: `clearSelectedPerson()`

### `CustomerPortfolioLayout` (new)

- Same pattern as `EmployeePortfolioLayout` but for customers
- Calls `setSelectedPerson({ type: 'customer', ...data })`
- Route: `/customer-portfolio?customerId=...`

---

## 7. openService Update

```typescript
// useOpenService.ts
const { person } = useSelectedPersonStore.getState();

if (!person) {
  // open picker → waitForEmployee() → returns { idnt, personType }
  // then build URL param based on personType
}

// if person exists, build param from person.type:
const paramKey = person.type === 'employee' ? 'employeeId' : 'customerId';
```

---

## 8. Shell vite.config

```typescript
exposes: {
  './store':        './src/store/appContext.ts',
  './employeeStore':'./src/store/employeeStore.ts',  // kept — backward compat
  './personStore':  './src/store/personStore.ts',    // new — for direct imports
}
```

---

## File Change Summary

| File | Action |
|------|--------|
| `shell/src/store/personStore.ts` | **Create** — unified store + all hooks |
| `shell/src/store/employeeStore.ts` | **Update** — thin re-export for backward compat |
| `shell/vite.config.ts` | **Update** — expose `./personStore` |
| `mfe-search-employee/src/App.tsx` | **Update** — mixed results, new `onSelected(id, type)` |
| `shell/src/components/SelectEmployeePage.tsx` | **Update** — navigate by `personType` |
| `shell/src/components/EmployeePortfolioLayout.tsx` | **Update** — use `useSelectedPersonStore` |
| `shell/src/components/EmployeePickerPopup.tsx` | **Update** — cosmetic title |
| `shell/src/hooks/useOpenService.ts` | **Update** — read `person.type` |
| `shell/src/components/CustomerPortfolioLayout.tsx` | **Create** — customer portfolio page |
| `shell/src/App.tsx` | **Update** — add `/customer-portfolio` route |

## Files That Need NO Changes

| File | Reason |
|------|--------|
| `mfe-employee-portfolio/src/App.tsx` | Gets `EmployeeProfile` via `useEmployee` alias — unchanged |
| `shell/src/hooks/useEmployeePickerPopup.ts` | Already uses `PersonType`, already returns `{ idnt, personType }` |
| `shell/src/types/openService.ts` | `PersonType` already covers `'employee' \| 'customer'` |
