# Spec: Open Service Without Employee — Architecture

## Constraints

- `SearchEmployeeMFE` exposes `onSelected(idntEmployee: string)` — passes only the ID
- Full employee data is fetched inside `EmployeePortfolioLayout` — it owns `setEmployee`
- No other component should call `setEmployee`
- `EmployeePortfolioLayout` needs no changes

---

## Proposed Flow

```
┌────────────────────────────────────────────────────────────┐
│  User clicks service — no employee in store                │
│                                                            │
│  useOpenService                                            │
│    → navigate('/select-employee', {                        │
│        state: { pendingSherut: meta }  ← Service (raw)    │
│      })                                                    │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  SelectEmployeePage                                        │
│    reads: location.state.pendingSherut (Service)           │
│                                                            │
│    onSelected(idntEmployee):                               │
│      navigate(                                             │
│        `/employee-portfolio/sherutim/${meta.idntMenuItem}  │
│         ?employeeId=${idntEmployee}`,                      │
│        { state: location.state }  ← forward intact        │
│      )                                                     │
│                                                            │
│    <SearchEmployeeMFE onSelected={onSelected} />           │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  EmployeePortfolioLayout  (no changes)                     │
│    reads employeeId from URL → fetches → setEmployee()     │
│    renders <Outlet /> ──────────────────────────┐          │
└─────────────────────────────────────────────────┼──────────┘
                                                  │
                                                  ▼
┌────────────────────────────────────────────────────────────┐
│  SherutDynamicView                                         │
│    reads location.state.pendingSherut                      │
│    reads employee + isLoading from store                   │
│                                                            │
│    useEffect([idntSheryut, employee, isLoading]):          │
│      if (pendingSherut && (isLoading || !employee)) return │
│                          ↑ guard: wait for store to fill   │
│      // proceed with config fetch + MFE load as normal     │
└────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

### `useOpenService`
- **Change:** store `meta: Service` (not already-flat) in navigate state

### `SelectEmployeePage`
- **Change:** `onSelected(idntEmployee)` navigates to full sherut route, forwarding `location.state`
- No service logic, no `setEmployee` call

### `SherutDynamicView`
- **Change:** guard the load `useEffect` — if `pendingSherut` is present, skip until `employee !== null && !isLoading`
- Can also use `pendingSherut.serviceSrc` as the cached `mfeConfig` to skip the config fetch

### `EmployeePortfolioLayout`
- **No changes**

---

## SherutDynamicView — guard logic

```typescript
const location = useLocation();
const pendingSherut = (location.state as any)?.pendingSherut as Service | undefined;
const employee = useEmployeeStore((s) => s.employee);
const isLoading = useEmployeeStore((s) => s.isLoading);

useEffect(() => {
  if (!idntSheryut) return;
  if (pendingSherut && (isLoading || !employee)) return; // wait for store

  // existing: read cached mfeConfig from state, or fetch from API
  const cached = (location.state as any)?.mfeConfig
    ?? (pendingSherut?.serviceSrc
        ? { remoteUrl: pendingSherut.serviceSrc.remoteUrl,
            module:    pendingSherut.serviceSrc.module,
            scope:     pendingSherut.serviceSrc.scope }
        : undefined);
  // ... rest unchanged
}, [idntSheryut, employee, isLoading]);
```

**Why add `employee` and `isLoading` to the dependency array:**
The effect previously only depended on `idntSheryut`. Adding the store values makes it
re-run once the employee loads, so the guard clears and loading proceeds.

---

## State passing chain

```
useOpenService
  navigate('/select-employee', { state: { pendingSherut: meta } })
    ↓
SelectEmployeePage.onSelected(idntEmployee)
  navigate(`/employee-portfolio/sherutim/${meta.idntMenuItem}
            ?employeeId=${idntEmployee}`,
           { state: location.state })          ← transparent passthrough
    ↓
SherutDynamicView
  location.state.pendingSherut                 ← arrives intact
  waits for employee store before proceeding
```

---

## File Change Summary

| File | Change |
|------|--------|
| `shell/src/hooks/useOpenService.ts` | Pass `meta` (not `flat`) in navigate state |
| `shell/src/components/SelectEmployeePage.tsx` | `onSelected` navigates to full sherut route, forwards state |
| `shell/src/sections/SherutDynamicView.tsx` | Guard `useEffect` on employee store; use `pendingSherut.serviceSrc` as cached config |
| `shell/src/components/EmployeePortfolioLayout.tsx` | No changes |
