# SPEC — Shared Global-Sherutim Store (fetch-once across home Preview & Show-all)

**Status:** proposed — awaiting approval
**Scope:** the **global** sherutim shown on the home page (`/`) and its "הצג הכל" view.
Explicitly **NOT** the person-scoped sherutim inside `employee-portfolio`.

---

## 1. Problem

On the home page (`/`), the shell renders `mfe_sherutim/Preview` in **global mode** —
no `employeeId` ([App.tsx:94](../shell/src/App.tsx#L94)). The intended "הצג הכל" opens
`mfe_sherutim/Full`, also global. Both components resolve their data independently, so
the target production behavior fetches the **same global list twice** (once for Preview,
again for Full). The two views share no state.

This is about the **global** list — "sherutim that are not for an employee or customer."
The person-scoped Preview/Full rendered inside `employee-portfolio`
([employeeSections.ts](../shell/src/employeeSections.ts), keyed by `employeeId`) is **out
of scope** and must keep its current behavior.

## 2. Goal

One runtime source for the global list, shared by home `Preview` and global `Full`:

- Fetched **once per session** (data is fully global — **no cache key**).
- The second view to mount reads cache — **zero extra requests**.
- A fetch already in flight when the second view mounts is **awaited**, not restarted.

## 3. Why a store inside `mfe-sherutim` (not a webpack package, not the shell)

`Preview` and `Full` are exposed from the **same** MFE. At runtime the shell loads both
from one remote container, which instantiates each internal module **once**. So a
module-level Zustand store inside `mfe-sherutim`, imported by both, is already a singleton
across them — same pattern as [personStore.ts](../shell/src/store/personStore.ts).

- **Webpack package rejected:** adds a second build system; a plain npm package bundled
  into multiple MFEs produces multiple copies → multiple fetches. Runtime-singleton comes
  from Module Federation `shared: { singleton: true }` (already set for `zustand`), not
  from packaging.
- **Shell store rejected:** only the sherutim views need this data. Revisit only if
  another MFE needs the same global list.

## 4. Data model

Single global cache (no keying). Reuses existing types from [types.ts](src/types.ts).

```ts
type Status = 'idle' | 'loading' | 'loaded' | 'error';

interface SherutimStore {
  status: Status;
  items: SherutimItem[];   // mixed categories ('self') + services ('object')
  favoriteIds: string[];   // ids of favorite sherutim
  error?: unknown;
  fetchOnce: () => Promise<void>;
}
```

## 5. Fetch / dedup contract

- A **single** module-level `inFlight: Promise<void> | null` (outside Zustand state —
  promises don't belong in reactive state). `fetchOnce()`:
  1. `status === 'loaded'` → return resolved (no network).
  2. `inFlight` exists → return it (await the same request).
  3. else → set `status: 'loading'`, start the fetch, assign `inFlight`; on settle write
     `loaded`+data or `error`, then clear `inFlight`.
- The two sources (the items list and favorites) are fetched together via `Promise.all`
  inside `fetchOnce`. In this repo they resolve from mock modules; the existing
  `// In production: fetch('/api/...')` markers in
  [favoriteService.ts](src/services/favoriteService.ts) are preserved. The items list
  moves behind an equivalent async `getSherutimItems()` service (today a static import in
  [useSherutim.ts](src/hooks/useSherutim.ts)).
- Only the store calls the services; no component calls them directly after this change.

## 6. Public hook (unchanged return shape)

`useSherutim()` keeps its **current signature and return shape** so `Full.tsx` render
logic is untouched:

```ts
function useSherutim(): {
  categories: CategoryWithSherutim[];
  sherutim: SherutWithFavorite[];
  favorites: SherutWithFavorite[];
  loading: boolean;
}
```

Internally it now: selects `items` / `favoriteIds` / `status` from the store, calls
`fetchOnce()` in an effect (idempotent — safe when both views mount), and derives
`categories` / `sherutim` / `favorites` with the **existing** `useMemo` logic moved over
unchanged (split by `type`, attach `isFavorite`, group by `idntObjectAv === idntObject`).
`loading = status !== 'loaded'`.

## 7. Component + shell wiring

### 7a. `Preview.tsx` (data + show-all button)
- Read the list from `useSherutim()` and render the first 3 of `sherutim` instead of the
  static `MOCK_SHERUTIM.slice(0,3)` ([Preview.tsx:42](src/Preview.tsx#L42)). This makes
  Preview the **first** fetch trigger, so Full hits cache.
- Show "הצג הכל" whenever **`onShowAll` is provided**, instead of gating on `employeeId`
  ([Preview.tsx:32](src/Preview.tsx#L32)). Portfolio already passes `onShowAll`
  ([EmployeePortfolioIndex.tsx:25](../shell/src/components/EmployeePortfolioIndex.tsx#L25)),
  so its behavior is unchanged; the home page will now pass one too (7c).

### 7b. `Full.tsx` (back target for global mode)
- Data already comes from `useSherutim()` — no data change.
- Back button ([Full.tsx:312](src/Full.tsx#L312)) currently always returns to
  `/employee-portfolio?employeeId=...`. Branch on mode: `employeeId` present → keep that;
  otherwise navigate to `/` (home). No other Full change.

### 7c. Shell — wire the global "show all"
- **Home** ([App.tsx:94](../shell/src/App.tsx#L94)): pass
  `onShowAll={() => navigate('/sherutim')}` to the home `Preview` (add `useNavigate` in
  `RouterApp`).
- **New route** `/sherutim` (sibling of the existing `/sherutim/:idntSheryut/*`): renders
  `mfe_sherutim/Full` in global mode — `<Full openService={openService} navigate={navigate} />`,
  **no** `employeeId`.

## 8. Relationship to the employee-portfolio flow

`Preview`/`Full` are the same components reused there. Because the store is **global**,
the portfolio path reads the same global dataset it already shows today (the current code
also renders the same mock list regardless of `employeeId`), and its **routing/behavior
is unchanged**. If person-scoped data is ever wanted there, that is a separate change
(a keyed store) and is out of scope here.

## 9. Files

| File | Change |
|------|--------|
| `src/store/sherutimStore.ts` | **new** — global Zustand store, `fetchOnce`, in-flight promise |
| `src/services/sherutimService.ts` | **new** — `getSherutimItems()` (async wrapper over current static items) |
| `src/hooks/useSherutim.ts` | rewrite to read store + derive; keep signature/return shape |
| `src/Preview.tsx` | read from `useSherutim()`; show "הצג הכל" when `onShowAll` given |
| `src/Full.tsx` | back button branches global (`/`) vs portfolio |
| `shell/src/App.tsx` | home passes `onShowAll`; add `/sherutim` global route |

No change to `vite.config.ts`, exposes, or shared deps. Dead
[shell/src/sections/SherutimSection.tsx](../shell/src/sections/SherutimSection.tsx) is
left as-is (unused).

## 10. Out of scope

- Cache invalidation / TTL / manual refresh.
- Person-scoped data for the portfolio Full.
- Optimistic favorite toggling; Preview loading skeleton styling.
- Sharing the store with other MFEs via the shell.

## 11. Verification

1. Build shell → MFEs, run all 7 previews (build-run skill).
2. Open `/` with the network tab filtered to the sherutim fetch(es).
3. Home `Preview` renders → **one** fetch per source. Click "הצג הכל" → global `Full`
   renders with **no new** request; "← חזרה" returns to `/`.
4. Reopen show-all → still cache (no fetch) for the session.
5. Sanity: employee-portfolio sherutim Preview/Full still render as before.
