# Spec: Open Service in Overlay (v2 — decided by the service route)

## Goal

Some services (sherutim) open as a **floating window** instead of a full page. The service config
decides (`displaySettings: 'overlay'`), not the caller.

- An overlay exists **only inside a portfolio** (employee / customer). Never over the home page.
- Under the overlay the user sees the **person card** (portfolio header) and below it the
  **digital-objects MFE** — not the portfolio's home (preview) screen.
- The decision "full page or overlay" is made in **one place**: the service route component
  `SherutDynamicView` (`…/sherutim/:idntSheryut`), when it loads the service.
- The service inside the overlay can still **close** itself and **change size** (S / M / L).

### What changes from v1

| v1 (current code) | v2 |
|---|---|
| `useOpenService` decides overlay vs. navigate (`openType: 'overlay'`) | `useOpenService` **always navigates** to the service URL. No overlay logic in it. |
| Overlay + base page kept in `history.state` (`background`, `routesLocation`) | No history-state tricks. The URL is the service route, the route renders what it needs. |
| Base page = portfolio preview | Base = person card + digital objects |
| Overlay rendered once in `RouterApp`, outside `<Routes>` | Overlay rendered **inside** `SherutDynamicView` |
| Shared link → full page | Shared link → **same as in-app**: overlay over digital objects (config decides) |
| Possible on the home page | Only inside a portfolio |

---

## Routes

| URL | Rendered by | Overlay possible? |
|---|---|---|
| `/employee-portfolio/sherutim/:idntSheryut` | `EmployeePortfolioLayout` → `Outlet` → `SherutDynamicView` | ✅ |
| `/customer-portfolio/sherutim/:idntSheryut` | `CustomerPortfolioLayout` → `Outlet` → `SherutDynamicView` — **new route** | ✅ |
| `/sherutim/:idntSheryut` (no person) | `SherutimWrapper` → `SherutDynamicView` | ❌ always full page, even if the config says overlay |

`SherutDynamicView` gets a `portfolio` prop from the route (`'employee' | 'customer' | undefined`) —
the route declares where it is, the component doesn't parse the URL.

`resolveRoute` today builds `/employee-portfolio/sherutim/…` for every `objectType`. It changes to
pick the portfolio by the selected person's type (`customer` → `/customer-portfolio/sherutim/…`).

---

## Flow

```
MFE calls openService(meta)
        │
        ▼
useOpenService → resolveRoute(flat)
        │   openType: 'navigate' | 'blank'   (no 'overlay' anymore)
        │   state: { mfeConfig }             ← mfeConfig now carries displaySettings, overlaySize, title
        ▼
navigate('/employee-portfolio/sherutim/SHR004?employeeId=1001&q=…', { state })
        │
        ▼
EmployeePortfolioLayout (person card stays mounted) → Outlet → SherutDynamicView portfolio="employee"
  1. config = location.state.mfeConfig ?? await getSherutMfeConfig(id)   ← direct link / reload
  2. Component = await loadRemoteModule(config.remoteUrl, config.module)
  3. decide:
       config.displaySettings === 'overlay' && portfolio
         → <SherutOverlayView>   = digital-objects MFE + <ServiceOverlay> with the service inside
       else
         → full page, as today
```

### Service config

`SherutMfeConfig` (from `getSherutMfeConfig`, and the same shape passed in navigation state) gains:

```ts
interface SherutMfeConfig {
  // … existing: remoteUrl, scope, module, objectType, selectedActiveTab, extendedTabDataUrl
  displaySettings?: 'overlay';     // absent → full page
  overlaySize?: 's' | 'm' | 'l';   // initial size, default 'm'
  title?: string;                  // overlay title bar
}
```

The API (`/api/sherutim/:id/mfe-config`) must return these too, so a direct link or reload knows
it's an overlay service. Until then the mock returns them for `SHR004` / `SHR006`.

---

## SherutOverlayView — what's under and over

```
┌ EmployeePortfolioLayout ──────────────────────────────────────┬──────────┐
│  person card + tabs (EmployeePortfolioHeader)  — unchanged     │ side nav │
├────────────────────────────────────────────────────────────────┤          │
│  digital-objects MFE (fills the content area)                  │          │
│                                                                │          │
│   ┌───────────────────────────┐                                │          │
│   │ Service title     S M L × │                                │          │
│   ├───────────────────────────┤                                │          │
│   │   service MFE             │                                │          │
│   └───────────────────────────┘                                │          │
└────────────────────────────────────────────────────────────────┴──────────┘
```

- `SherutOverlayView` (new, `shell/src/components/overlay/SherutOverlayView.tsx`) renders:
  1. the digital-objects section (from `SECTIONS`, the same component the preview uses), and
  2. `<ServiceOverlay>` with the already-loaded service component.
- The portfolio layout (card, tabs, side nav) is untouched — it's the parent route.

---

## Closing and size

| Trigger | Result |
|---|---|
| × in the title bar / `Esc` | `navigate(portfolioRoot + search)` → portfolio home |
| Service calls `onClose()` ("save and close") | same |
| Browser Back | the browser leaves the route → overlay is gone (it's just a route) |
| S / M / L in the title bar | size changes |
| Service calls `onResize('s' \| 'm' \| 'l')` | size changes — **new** |

Size and drag position are local state in `ServiceOverlay`. They reset when the route unmounts.

### Contract with the service MFE

```ts
interface SherutProps {
  idntSheryut: string;
  employeeId: string;
  displayMode: 'page' | 'overlay';
  /** page: back to the portfolio. overlay: close the window (also back to the portfolio). */
  onClose: () => void;
  /** overlay only — ask the shell to change the window size. */
  onResize?: (size: 's' | 'm' | 'l') => void;
}
```

---

## The window

Unchanged from v1 except where it is rendered:

- `position: fixed`, opens in the **bottom-left corner** (24px from left and bottom).
- Transparent full-viewport backdrop blocks clicks on the page underneath (card, digital objects,
  side nav, header). No dim, no blur.
- Sizes (placeholders until Figma): `s` 400×480, `m` 640×600, `l` 960×min(800, viewport).
  All capped by the viewport.
- Drag by the title bar (phase 2), position resets on close.
- `role="dialog"`, `aria-modal`, focus in on open, `Esc` closes.
- Layering: backdrop and window above the header; `EmployeePickerPopup` above the overlay.

---

## Files

| File | Change |
|------|--------|
| `shell/src/hooks/useServiceOverlay.ts` | **Delete** — no more overlay state in `RouterApp` |
| `shell/src/hooks/useOpenService.ts` | Drop `showOverlay` param and `case 'overlay'` |
| `shell/src/services/openService.ts` | `resolveRoute`: no `overlay` branch; put `displaySettings`, `overlaySize`, `title` into `state.mfeConfig`; customer portfolio URL |
| `shell/src/types/openService.ts` | `OpenType = 'navigate' \| 'blank'`; remove `OverlayService` / `ResolvedRoute.overlay` |
| `shell/src/services/sherutimService.ts` | `SherutMfeConfig` + `displaySettings`, `overlaySize`, `title`; mock returns overlay for SHR004/SHR006 |
| `shell/src/sections/SherutDynamicView.tsx` | Read config (state → API fallback), decide page vs. overlay, `portfolio` prop |
| `shell/src/components/overlay/SherutOverlayView.tsx` | **New** — digital objects + `<ServiceOverlay>` |
| `shell/src/components/overlay/ServiceOverlay.tsx` | Takes the loaded component + config + `onClose` as props; local size state; passes `onResize` |
| `shell/src/utils/overlayBase.ts` | **Delete** (or keep only `PORTFOLIO_ROOTS` if needed for close) |
| `shell/src/App.tsx` | Remove `useServiceOverlay`, `routesLocation`, `<ServiceOverlay>`; add `/customer-portfolio/sherutim/:idntSheryut/*` |
| `shell/src/components/CustomerPortfolioLayout.tsx` | Provide `mfeConfig` outlet context like the employee layout (or `SherutDynamicView` stops needing it — see step 1 of the flow) |

---

## Decisions

1. **Digital objects under the overlay — the Full component.** The Preview's extended filter
   navigates to full mode (and so closed the overlay); Full toggles its filters in place.
   "חזרה" goes to the portfolio home (closes the overlay, like ×).
2. **Opening another service from inside the overlay replaces it** — it's a plain navigation. The
   v1 notice "יש לסגור קודם את השירות הפתוח" is dropped.
3. **× / Esc / `onClose` go to the portfolio home** (`/<portfolio>-portfolio` + current search).

---

## v3 — the page behind stays usable

The overlay is no longer modal. While it is open, the user can keep working with the digital
objects behind it, and a digital object can itself open a service (e.g. an "edit" service that is
an overlay). So the rule is now: **at most one overlay at a time.**

### What changes

| Today (v2) | v3 |
|---|---|
| Transparent full-screen backdrop blocks every click | **No backdrop** — page, side nav and header are clickable |
| Digital objects under the overlay rendered without handlers | Rendered **like on the portfolio home**: `openService`, `onShowAll`, `onFocusItem` |
| `role="dialog" aria-modal="true"` | `role="dialog"` without `aria-modal`; `Esc` closes **only when focus is inside the window** |
| Second overlay → replaces the first (it's a navigation) | Second overlay → **blocked**: the open window flashes + a short message |

### "One overlay at a time" — who knows an overlay is open

`useOpenService` (in `RouterApp`) has to know, before it navigates, that an overlay is already
open. The only one who knows is `SherutOverlayView` (deep inside the service route). On a direct
link / reload there is no navigation state to read either. So a **tiny Zustand store** carries it:

```ts
// shell/src/store/overlayStore.ts
interface OverlayStore {
  openServiceId: string | null;   // set by SherutOverlayView on mount, cleared on unmount
  nudgeCount: number;             // ++ every time a second overlay is blocked
  setOpen: (id: string | null) => void;
  nudge: () => void;
}
```

- **Not exposed to MFEs** (not in `vite.config` `exposes`). MFEs still only call `openService`.
- It is UI state of the shell, same family as `appContext` / `personStore`.

### Flow

```
digital object (behind the overlay) → openService(meta)
        │
        ▼
useOpenService: flat.isOverlay && overlayStore.openServiceId
        ├─ yes → overlayStore.nudge(); stop           ← no navigation
        └─ no  → navigate as usual (v2)

ServiceOverlay subscribes to nudgeCount:
  1. window flashes (blue ring pulse, ~0.4s × 2)
  2. banner under the title bar for ~2s: "יש כבר שירות פתוח, יש לסגור אותו קודם"
```

- Clicking the **same** overlay service again counts as a second overlay → nudge.
- A **page** service (not overlay) opened from behind still navigates — it leaves the route, so the
  overlay closes. Same for `onShowAll` / `onFocusItem` of the digital objects (they navigate away).

### Files

| File | Change |
|------|--------|
| `shell/src/store/overlayStore.ts` | **New** — `openServiceId`, `nudgeCount`, `setOpen`, `nudge` |
| `shell/src/hooks/useOpenService.ts` | Block a second overlay → `nudge()` |
| `shell/src/components/overlay/SherutOverlayView.tsx` | `setOpen(id)` on mount / `setOpen(null)` on unmount; digital objects get `openService` + navigation handlers |
| `shell/src/components/overlay/ServiceOverlay.tsx` | Remove backdrop and `aria-modal`; `Esc` only inside; flash + banner on `nudgeCount` |
| `shell/src/sections/SherutDynamicView.tsx` | Accept `openService` and pass it down |
| `shell/src/App.tsx` | Pass `openService` to both `SherutDynamicView` portfolio routes |
| `shell/src/index.css` | `@keyframes` for the flash |

---

## What this does NOT do

- Does not open an overlay outside a portfolio — `/sherutim/:id` is always a full page.
- Does not let a caller force overlay/page — the service config decides.
- Does not support free resize — only S / M / L (by the user or by the service).
- Does not warn about unsaved changes on close.
- Does not support `target=blank` services in an overlay; those still open in a new tab.
