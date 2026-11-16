# Spec: Overlay Service as a Nested Route of digital-objects

Builds on [SPEC-service-overlay.md](SPEC-service-overlay.md) (v2). Only the **route** of an overlay
service and its **close** target change. The overlay window itself (`ServiceOverlay`: size, drag,
minimize, one-at-a-time nudge) is unchanged.

## Problem

An overlay service is always shown over the digital-objects page, but its route is a **sibling** of it:

```
/employee-portfolio/digital-objects          → SectionFullView → DigitalObjects (instance A)
/employee-portfolio/sherutim/123             → SherutDynamicView → SherutOverlayView
                                                 → DigitalObjects (instance B, new) + ServiceOverlay
```

1. **Filters reset.** Clicking "edit" on a digital object unmounts instance A and mounts a fresh
   instance B. Filter state (`useState` in `mfe-digital-objects/src/Full.tsx`) is lost.
2. **Close goes to the wrong page.** Closing navigates to `/employee-portfolio` (portfolio home),
   not back to digital-objects.
3. `SherutOverlayView` renders its own copy of `DigitalObjects`, which duplicates `SectionFullView`
   (the props, `backToPreview` and `onFocusItem` are all wired twice).
4. **Free-text search resets when "edit" is clicked in the Preview** (portfolio home). The Preview has its
   own `search` state (`mfe-digital-objects/src/Preview.tsx`) and its own "edit" button. Opening
   the overlay navigates to `…/digital-objects/sherutim/:id`, so the Preview unmounts and a new
   `Full` mounts with an empty search. The nested route alone doesn't fix this, because it's a
   different component. See [Free-text search in the URL](#free-text-search-in-the-url).

## Rule

An overlay service is **always** shown over digital-objects, no matter where it was opened:

| Opened from | Before | After |
|---|---|---|
| digital-objects full page ("edit") | filters reset | **filters kept**: same instance stays mounted |
| Portfolio home, digital-objects Preview ("edit") | search reset | **free-text search kept** (URL), extended filters n/a in Preview |
| Portfolio home, digital-services section | digital-objects under the overlay | same, digital-objects starts unfiltered |
| Digital-services full page | digital-objects under the overlay | same, digital-objects starts unfiltered |

**Closing (×, Esc, `onClose()`) always stays on digital-objects** (`navigate('..')`), also when the
service was opened from the portfolio home or the digital-services page.

## Routes

```
/employee-portfolio/digital-objects                        ← page
/employee-portfolio/digital-objects/sherutim/:idntSheryut  ← page + overlay (child route)
/employee-portfolio/sherutim/:idntSheryut                  ← full-page service (unchanged)
```

Same for `/customer-portfolio/…`. The customer portfolio has no digital-objects route today; it gets one.

### shell/src/App.tsx

```tsx
<Route path="/employee-portfolio" element={<Padded><EmployeePortfolioLayout /></Padded>}>
  <Route index element={<EmployeePortfolioIndex openService={openService} />} />

  {/* NEW: must come before :section / :section/:itemId (static segments win anyway, but keep it explicit) */}
  <Route path="digital-objects" element={<DigitalObjectsPage portfolio="employee" openService={openService} />}>
    <Route path="sherutim/:idntSheryut/*" element={<SherutDynamicView portfolio="employee" openService={openService} />} />
  </Route>

  <Route path="sherutim/:idntSheryut/*" element={<SherutDynamicView portfolio="employee" openService={openService} />} />
  <Route path=":section/:itemId" element={<ExternalIframeView />} />
  <Route path=":section" element={<LegacySectionRedirect openService={openService} />} />
</Route>

<Route path="/customer-portfolio" element={<Padded><CustomerPortfolioLayout /></Padded>}>
  …existing…
  <Route path="digital-objects" element={<DigitalObjectsPage portfolio="customer" openService={openService} />}>
    <Route path="sherutim/:idntSheryut/*" element={<SherutDynamicView portfolio="customer" openService={openService} />} />
  </Route>
</Route>
```

`/employee-portfolio/digital-objects/:itemId` (iframe focus view) keeps working: `:section/:itemId`
matches it, and `digital-objects/sherutim/:id` has three segments, so the two never collide.

## Where the code lives

All in the **shell**. The digital-objects MFE does not change and knows nothing about the overlay
(it has no `<Outlet />`, so it doesn't depend on the shell's router).

### New: `DigitalObjectsPage` (shell/src/components/DigitalObjectsPage.tsx)

```tsx
const DigitalObjectsPage = ({ portfolio, openService }) => (
  <>
    <SectionFullView section="digital-objects" portfolio={portfolio} openService={openService} />
    <Outlet />   {/* overlay, only when the URL has sherutim/:id */}
  </>
);
```

`SectionFullView` stays mounted while the URL switches between the page and the page + overlay, so
the MFE keeps its state. `ServiceOverlay` is `position: fixed`, so it floats over the page even
though it sits next to it in the DOM.

### `SectionFullView`

- Takes an optional `section` prop (falls back to `useParams().section` as today).
- Takes `portfolio` (`'employee' | 'customer'`, default `'employee'`). `backToPreview` and
  `onFocusItem` use `/${portfolio}-portfolio/…` instead of the hardcoded `/employee-portfolio`.
  The iframe focus view stays employee-only, as today (`onFocusItem` is `undefined` for customer).
- Reads the person id with `Helper.getParam` for `employeeId` / `customerId`.

### `SherutOverlayView` gets smaller

It no longer renders `DigitalObjects`. It is left with the `overlayStore` open/close marking and
`<ServiceOverlay>`. The `backToPreview` and `onFocusItem` wiring moves out (`SectionFullView` already has it).

### `SherutDynamicView`

- `goBack` for an overlay: `navigate({ pathname: '..', search: location.search }, { relative: 'path' })`,
  which goes to `…/digital-objects` with the same `employeeId` / `customerId` / `q`.
- Full-page `goBack`: unchanged (portfolio home).
- **Config and route don't match**: the config comes from navigation state or the API, and the route
  can disagree with it after a shared link or an older URL. In that case it redirects with `<Navigate replace>`:
  - At `…/sherutim/:id` and the config says overlay, go to `…/digital-objects/sherutim/:id`
    (keeps old shared links working).
  - At `…/digital-objects/sherutim/:id` and the config says full page, go to `…/sherutim/:id`.
  - `location.state` (`mfeConfig`) and `search` are passed along so the redirect doesn't refetch.

### `resolveRoute` (shell/src/services/openService.ts)

```ts
const base = `${portfolioRoot(flat.personType)}${flat.isOverlay ? '/digital-objects' : ''}`;
const url = flat.objectType == null
  ? Helper.buildUrl(`sherutim/${flat.idntMenuItem}`, qs)          // no portfolio: unchanged, always full page
  : Helper.buildUrl(`${base}/sherutim/${serviceId}`, qs);
```

### `EmployeePortfolioLayout`

- `isSectionFull` uses `useMatch('/employee-portfolio/:section')`, which doesn't match
  `digital-objects/sherutim/123`. The layout height would jump when the overlay opens. It changes to
  also match `/employee-portfolio/digital-objects/*`.
- `sherutMatch` (`/employee-portfolio/sherutim/:idntSheryut/*`) also matches
  `/employee-portfolio/digital-objects/sherutim/:idntSheryut/*`, so the existing behavior
  driven by it stays the same for overlay services.
- `CustomerPortfolioLayout`: check for the same matches and apply the same changes.

## Free-text search in the URL

Only the **free-text search** box on digital-objects (Preview and Full) moves to the URL. The
extended filters (type / status / year) stay in `useState` in `Full`. The nested route already
keeps them, and the Preview doesn't have them.

```
/employee-portfolio?employeeId=1001&doSearch=מחשב
        │  "edit" in the Preview → resolveRoute → Helper.buildQParam keeps plain params
        ▼
/employee-portfolio/digital-objects/sherutim/SHR004?employeeId=1001&doSearch=מחשב&q=…
        → Full mounts and reads doSearch="מחשב"
```

- **Param:** `doSearch`, a plain query param (not inside `q`). Removed when the search is empty.
- **The shell owns the URL, the MFE doesn't touch the router.** The digital-objects MFE doesn't use
  react-router (it isn't shared in its federation config, and its standalone `main.tsx` has no
  Router). The existing pattern is that the shell passes callbacks (`navigate`, `onShowAll`). Same here:

  ```ts
  // SectionProps (shell/src/employeeSections.ts) + the MFE's Props
  /** free-text search, owned by the host (URL). Absent → the MFE keeps it in local state */
  search?: string;
  onSearchChange?: (value: string) => void;
  ```

  - **Shell** (`SectionFullView` for Full, `EmployeePortfolioIndex` for Preview, and the customer
    equivalents): `search = searchParams.get('doSearch') ?? ''`, and `onSearchChange` calls
    `setSearchParams(…, { replace: true })`, so typing doesn't add history entries.
  - **MFE** (`Preview.tsx`, `Full.tsx`): controlled when `onSearchChange` is given, otherwise its
    local `useState` as today, so standalone mode and older shells keep working.
- **Why it's carried along for free:** `Helper.buildQParam` already copies the current plain params
  into the next URL, and closing the overlay (`navigate('..')` with `location.search`), "show all"
  and "back to preview" all pass `search` through. Opening, closing, show-all and back all keep the search.
- **Side effect:** the search also survives reload and shared links.
- **Cleared when the person changes.** The home page and `SelectEmployeePage` already build a fresh
  URL (`?employeeId=<id>`), so they drop it. Any other path that keeps the URL and swaps only the id
  (e.g. a person switch from inside the portfolio) is covered in the layouts:
  `EmployeePortfolioLayout` / `CustomerPortfolioLayout` remember the previous person id in a ref. When
  it changes (not on the first mount), they remove `doSearch` with `setSearchParams(…, { replace: true })`.

## Does digital-objects remount when the overlay opens?

| Opened from | digital-objects | Why |
|---|---|---|
| digital-objects full page | **No remount.** It re-renders, same instance, state kept | `DigitalObjectsPage` is the same route element for `digital-objects` and `digital-objects/sherutim/:id`. Only its `<Outlet />` content changes |
| Portfolio home (Preview) / digital-services page | **Mounts** (it wasn't on screen), search restored from `doSearch` | Different route, so the Preview unmounts |

To keep the "no remount" case true:
- `SectionFullView` re-renders because `location` changes (`state` becomes `{ mfeConfig }`, `q` is
  added to `search`). That's only a re-render. `previewState` turns `undefined`, but `Full` reads it only
  as an initial `useState` value, so nothing happens.
- Nothing under the layout may be keyed by `location` / `pathname`, and the layout must not switch its
  JSX tree on the URL. Today `isSectionFull` only changes a `className`, so that's fine.
- The layout hides `<Outlet />` while `loading` is true. That happens only when the person id changes,
  never on opening or closing the overlay.

## Flow (edit from digital-objects)

```
/employee-portfolio/digital-objects?employeeId=1001      user filters by type + status
        │  click "edit" → openService(meta)  (isOverlay)
        ▼
resolveRoute → /employee-portfolio/digital-objects/sherutim/SHR004?employeeId=1001&q=…
        │
        ▼
EmployeePortfolioLayout  (mounted)
  └ DigitalObjectsPage   (mounted)
      ├ SectionFullView → DigitalObjects   (same instance, filters kept)
      └ Outlet → SherutDynamicView → SherutOverlayView → ServiceOverlay
        │  × / Esc / onClose()
        ▼
navigate('..') → /employee-portfolio/digital-objects?employeeId=1001   (filters still there)
```

## Out of scope

- **Extended filters in the URL** (type / status / year): stay in `useState`. They are only in `Full`,
  which the nested route keeps mounted. Can be moved to the URL later, the same way as `doSearch`.
- `ServiceOverlay` behavior (size, drag, minimize, mobile, nudge): unchanged.
- The global `/sherutim/:id` route (no person): unchanged, always full page.

## Test checklist

1. digital-objects, set filters, edit an object → overlay opens, filters and scroll kept.
2. Close (×, Esc, service `onClose`) → stays on digital-objects, filters kept, overlay gone.
3. Portfolio home → digital-services section → overlay service → URL is `…/digital-objects/sherutim/:id`,
   digital-objects under it. Close → digital-objects.
4. Digital-services full page → overlay service → same as 3.
5. Full-page service from anywhere → `…/sherutim/:id`, unchanged.
6. Reload on `…/digital-objects/sherutim/:id` → page + overlay.
7. Old link `…/sherutim/SHR004` (overlay service) → redirected to `…/digital-objects/sherutim/SHR004`.
8. Second overlay while one is open → nudge, no navigation (unchanged).
9. Browser Back while the overlay is open → overlay closes. If it was opened from digital-objects,
   the filters are kept.
10. Customer portfolio: 1–7 under `/customer-portfolio/…`.
11. `/employee-portfolio/digital-objects/:itemId` (iframe focus) still works.
12. Portfolio home: type in the digital-objects Preview search, click "edit" → overlay over
    digital-objects, and `Full` shows the same search text and filtered rows. Close → search still there.
13. Typing in the search doesn't add history entries (Back leaves the page, not one character).
14. Preview search → "show all" → `Full` has the same search. "Back" → Preview has the same search.
15. Standalone digital-objects (`:3004`, no shell props) → search works locally as before.
16. Search in digital-objects, then switch person → the search box is empty for the new person.
17. digital-objects full page: open and close an overlay → no "loading" fallback flashes, and the scroll position stays.
