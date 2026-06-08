# Spec: Change Employee Within EmployeePortfolioLayout

## Goal

While the user is inside the portfolio (employee profile visible, or a sherut open),
they can switch to a different employee without navigating back to the home page.
The currently open sherut stays open and reloads for the new employee.
`EmployeePortfolioMFE` updates automatically.

---

## Placement

`SearchPersonMFE` is rendered **above `EmployeePortfolioMFE`** inside the existing
left column (25% sticky panel) of `EmployeePortfolioLayout`.

No popup. No new route. The search is always visible while inside the portfolio.

---

## UI Sketch

```
EmployeePortfolioLayout
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────┐  ┌────────────────────────────────────┐ │
│  │                  │  │                                    │ │
│  │ SearchPersonMFE  │  │   <Outlet>                         │ │
│  │ (compact search) │  │                                    │ │
│  │                  │  │   EmployeePortfolioIndex           │ │
│  ├──────────────────┤  │     OR                             │ │
│  │                  │  │   SherutDynamicView ← stays open   │ │
│  │ EmployeePortfolio│  │                                    │ │
│  │ MFE              │  │                                    │ │
│  │ (profile card)   │  │                                    │ │
│  │                  │  │                                    │ │
│  └──────────────────┘  └────────────────────────────────────┘ │
│  ← 25% sticky panel →  ←──────── flex: 1 ────────────────────┘
└──────────────────────────────────────────────────────────────┘
```

Both panels are inside the same sticky left column — `SearchPersonMFE` on top,
`EmployeePortfolioMFE` below it. The right column (`<Outlet>`) is untouched.

---

## onSelected Logic — Smart URL Navigation

When the user picks a person from `SearchPersonMFE` inside the layout, the callback
inspects the **current pathname** to decide where to navigate:

```ts
const onSelected = (id: string, personType: PersonType) => {
  if (personType === 'customer') {
    navigate(`/customer-portfolio?customerId=${id}`);
    return;
  }

  // employee — preserve the sherut route if one is open
  const sherutMatch = pathname.match(/\/sherutim\/([^/?]+)/);
  if (sherutMatch) {
    // stay on the same sherut, swap employeeId only
    navigate(`/employee-portfolio/sherutim/${sherutMatch[1]}?employeeId=${id}`);
  } else {
    navigate(`/employee-portfolio?employeeId=${id}`);
  }
};
```

The URL is the only thing that changes. The layout's existing `useEffect([employeeId])`
does the rest.

---

## Automatic Update Chain

No new logic is needed beyond the `onSelected` above.
The existing chain handles everything:

```
onSelected(newId, 'employee')
        │
        ▼
navigate(... ?employeeId=newId)        ← URL changes
        │
        ▼
EmployeePortfolioLayout useEffect([employeeId]) fires
  └─ setLoading(true)
  └─ fetch PROFILES[newId]
  └─ setSelectedPerson({ type: 'employee', ...newProfile })
  └─ setLoading(false)
        │
        ▼
personStore updated
  ├─ EmployeePortfolioMFE re-renders   ← shows new employee profile
  └─ any consumer of useCurrentEmployee re-renders
        │
        ▼
<Outlet> stays mounted (same route)
  └─ SherutDynamicView reads employeeId from useSearchParams()
  └─ rerenders / refetches sherut data for the new employee
```

---

## SearchPersonMFE Props in This Context

```ts
<SearchPersonMFE
  onSelected={onSelected}
  // no objectType filter — show both employees and customers
/>
```

If the product only allows employee switching from within the portfolio,
pass `objectType={['employee']}` to hide customer results.

---

## File Changes

| File | Change |
|------|--------|
| `shell/src/components/EmployeePortfolioLayout.tsx` | Add `SearchPersonMFE` above `EmployeePortfolioMFE` in the left column; add `onSelected` with sherut-aware navigation |

No other files change.
`EmployeePortfolioMFE`, `SherutDynamicView`, `personStore`, and `openService` are untouched.

---

## What Does NOT Change

- `SelectEmployeePage` on the home page — unchanged, still navigates to `/employee-portfolio`
- `EmployeePickerPopup` — still used by `openService` when no person is in the store
- `personStore` — no new fields or actions
- `SherutDynamicView` — already reads `employeeId` from `useSearchParams()`; it naturally
  reacts when the URL param changes
- Routing structure — no new routes

---

## Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| User picks same employee again | URL unchanged → no re-fetch (React Router deduplicates) |
| User picks a customer from within the employee portfolio | Navigate to `/customer-portfolio?customerId=X` (leave employee portfolio entirely) |
| `PROFILES[newId]` not found | Layout sets `notFound = true`; existing "עובד לא נמצא" message shown; sherut outlet hidden |
| Sherut is loading when employee is switched | `employeeId` change triggers new layout fetch; `SherutDynamicView` re-mounts with new params |
