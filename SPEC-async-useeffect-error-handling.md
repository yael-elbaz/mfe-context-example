# Spec: Shell-level MFE Error Handling — "destroy is not a function"

## The real error

When an MFE does `useEffect(async () => {...})`, React internally stores the
return value as the cleanup function ("destroy"). On unmount it calls `destroy()`.
Since `destroy` is a `Promise`, not a function, React throws:

```
TypeError: destroy is not a function
```

This happens inside React's **commit phase** (not render), but React catches it with
`captureCommitPhaseError` which **does propagate to the nearest ErrorBoundary**.

---

## Goal

- Do NOT touch any MFE code
- Shell catches the crash gracefully
- Show a friendly error message instead of a blank / broken page

---

## Solution — ErrorBoundary around DynamicComponent in SherutDynamicView

`DynamicComponent` is where the MFE is rendered. Wrapping it in an ErrorBoundary
at this exact point means:
- Any crash from the MFE (render error or commit-phase error) is caught here
- The rest of the shell (header, sidebar, portfolio layout) stays intact
- Only the MFE content area shows the error message

```
EmployeePortfolioLayout          ← untouched, stays alive
  └─ SherutimWrapper             ← untouched
       └─ SherutDynamicView
            └─ MFEErrorBoundary  ← NEW — wraps only the dynamic component
                 └─ DynamicComponent (MFE)  ← crash is caught here
```

### SherutDynamicView — before

```tsx
<DynamicComponent idntSheryut={id} employeeId={person?.id ?? ''} />
```

### SherutDynamicView — after

```tsx
<MFEErrorBoundary>
  <DynamicComponent idntSheryut={id} employeeId={person?.id ?? ''} />
</MFEErrorBoundary>
```

Where `MFEErrorBoundary` shows:

```
❌ שגיאה בטעינת השירות
המודול החיצוני השתמש ב-async useEffect או נכשל בזמן ריצה.
[כפתור: ← חזרה]
```

---

## Files to change

| File | Change |
|------|--------|
| `shell/src/sections/SherutDynamicView.tsx` | Wrap `<DynamicComponent>` in an ErrorBoundary |

That's it. No MFE changes needed.
