# Spec: Open Service in Overlay

## Goal

Some services (sherutim) open as a **floating window** over the current screen instead of
replacing it. The page underneath stays where it is; the user works in the overlay, then closes it
and is back exactly where they were.

- Opens anchored to the **bottom-left corner** of the viewport.
- Three sizes — **S / M / L**. The service config picks the initial size; the user can switch.
- The user can **drag** the window by its title bar.
- **Modal**: while it's open, the page underneath stays visible but **can't be clicked**.
- Closes by the **cancel (×) button**, or **from inside the service** (e.g. "save and close").
- Inside a **portfolio** (employee / customer), the page under the overlay is always the portfolio's
  **preview** screen — see [Base page](#base-page).

Whether a service opens in an overlay is a **property of the service** (its config,
`displaySettings: 'overlay'`), not something the caller or the URL decides. This keeps the rule from
`SPEC-open-service.md`: MFEs declare intent, the shell owns how and where things open.

### Not in the URL

The overlay is **UI state in the shell**, not part of the URL:

- The service config already says it's an overlay service — the URL doesn't need to repeat it.
- The URL keeps describing the **page** (`/employee-portfolio?employeeId=…`); the overlay floats on top.
- Consequences, accepted on purpose:
  - A **reload** closes the overlay (the page underneath reloads as usual).
  - **Browser Back** does not close the overlay by itself — it navigates the page (see [Closing](#closing)).
  - A link can't be shared "with the overlay open".

---

## What exists today

| Piece | Status |
|---|---|
| `flattenMeta` reads `displaySettings === 'overlay'` → `isOverlay` | ✅ exists |
| `DigitalService.overlaySize`, `overlayIcon` | ✅ typed, not used |
| `resolveRoute` returns `openType: 'overlay'` | ✅ exists |
| `useOpenService` — `case 'overlay'` | ⚠️ falls through to `navigate` (opens as a full page) |
| Loading a sherut MFE at runtime (`loadRemoteModule`) | ✅ exists, used by `SherutDynamicView` |
| `useEmployeePickerPopup` + `<EmployeePickerPopup {...pickerProps}/>` in `RouterApp` | ✅ the pattern the overlay copies |

So the decision is already made upstream; this spec adds the overlay hook and the window itself.

---

## Base page

The overlay sits on top of a **base page**. Which page that is depends on where the user is when
the service opens:

| User is on | Base page under the overlay |
|---|---|
| `/employee-portfolio` (preview) | stays — no navigation |
| `/employee-portfolio/<section>` (section full mode) | `/employee-portfolio` (preview) |
| `/employee-portfolio/<section>/<itemId>` (iframe view) | `/employee-portfolio` (preview) |
| `/employee-portfolio/sherutim/<id>` (service page) | `/employee-portfolio` (preview) |
| `/customer-portfolio` (preview) | stays — no navigation |
| `/customer-portfolio/sherutim` (full mode) | `/customer-portfolio` (preview) |
| anywhere else (home, `/sherutim/...`) | the current page, unchanged |

Rule: **inside a portfolio, the base is the portfolio root (its preview); everywhere else, the current page.**

- The current query string is kept (`employeeId`, …) — the same thing `backToPreview` does
  (`/employee-portfolio${search}`), so the preview shows the same person.
- The portfolio layout (side nav, employee header) stays mounted, because only the child route changes.
- The list of portfolio roots lives in one place (`PORTFOLIO_ROOTS`). A new portfolio is one line there.

```ts
const PORTFOLIO_ROOTS = ['/employee-portfolio', '/customer-portfolio'];

/** the page the overlay opens on top of */
function overlayBasePath(pathname: string): string {
  return PORTFOLIO_ROOTS.find(root => pathname === root || pathname.startsWith(root + '/')) ?? pathname;
}
```

---

## Overlay state — a hook, not a store

No global store is needed. The only two places that touch the overlay — `useOpenService` (opens it)
and the window (renders and closes it) — both live in **`RouterApp`**. So the state is a plain
`useState` in a hook called there, exactly like `useEmployeePickerPopup` / `pickerProps` today:

```ts
// RouterApp
const { waitForEmployee, pickerProps } = useEmployeePickerPopup();
const { showOverlay, overlayProps } = useServiceOverlay();
const { openService } = useOpenService(waitForEmployee, showOverlay);
...
<ServiceOverlay {...overlayProps} />
<EmployeePickerPopup {...pickerProps} />
```

```ts
type OverlaySize = 's' | 'm' | 'l';

interface OverlayService {
  serviceId: string;              // idntMenuItem (same value as idntSheryut)
  title: string;                  // shown in the title bar
  mfeConfig?: SherutMfeConfig;    // remoteUrl / scope / module — fetched if missing
  params: Record<string, string>; // the service's own params (sherutimUrlParams)
  size: OverlaySize;              // from service config, default 'm'
}

function useServiceOverlay(): {
  showOverlay: (s: OverlayService) => void;   // ignored + message if one is already open
  overlayProps: {
    service: OverlayService | null;           // null → nothing rendered
    blockedNotice: boolean;                   // "close the open service first" is showing
    onClose: () => void;
  };
};
```

- Size switching and drag position are local state **inside `ServiceOverlay`** — nobody else needs them.
- MFEs never see this hook; they open via `openService` and close via `onClose`.
- `mfeConfig` comes from the service metadata when available, otherwise `getSherutMfeConfig(serviceId)`
  — the same fallback `SherutimWrapper` uses.
- If one day something outside `RouterApp` needs to open or read the overlay, that's the point to
  move it into a Zustand store. Not before.

---

## Flow

```
MFE calls openService(meta)
        │
        ▼
flattenMeta(meta)            → isOverlay = displaySettings === 'overlay'
        │                       overlaySize from menuParams (default 'm')
        ▼
resolveRoute(flat)           → { openType: 'overlay', serviceId, params, mfeConfig?, size }
        │
        ▼
useOpenService  case 'overlay':
  1. base = overlayBasePath(location.pathname)
  2. if base !== location.pathname → navigate(base + location.search)   ← e.g. full mode → preview
  3. showOverlay({ serviceId, title, mfeConfig, params, size })
        │
        ▼
<ServiceOverlay {...overlayProps}/> (rendered once in RouterApp, outside <Routes>)
  └─ service !== null
  1. mfeConfig  = overlay.mfeConfig ?? await getSherutMfeConfig(serviceId)
  2. Component  = await loadRemoteModule(mfeConfig.remoteUrl, mfeConfig.module)
  3. render     <Component {...serviceProps} displayMode="overlay" onClose={close} />
```

### Only one overlay at a time

If an overlay service is opened while another overlay is already open, the new one **does not open**
and the open one is **not replaced**. Instead the user sees a message:

> יש לסגור קודם את השירות הפתוח

- Since the page underneath is blocked, this can only happen from **inside the open service**
  (it calls `openService` for an overlay service). So the message is shown **inside the open
  window**, as a banner under the title bar — where the user is looking. No global toast is needed
  (the shell has none today).
- The banner hides itself after a few seconds, or when the user closes it.
- `showOverlay` checks `service !== null` → sets `blockedNotice` instead of opening.
- Services that open as a page (`navigate`) or in a new tab (`blank`) are not affected by this rule.

---

## Closing

| Trigger | Who |
|---|---|
| × (cancel) in the title bar | shell |
| `Esc` while focus is inside the overlay | shell |
| "Save and close" or any other operation inside the service | the MFE calls `onClose()` |
| Browser Back / any route change | shell, automatically |

All of them call `onClose` from `overlayProps`. Closing **doesn't navigate** — the user stays on the
base page (in a portfolio: the preview).

- **Clicking the backdrop does not close** — a stray click must not throw away what the user typed.
- **No unsaved-changes warning.** × closes immediately; the shell doesn't ask the MFE whether it has unsaved work.
- **Auto-close on route change.** The page underneath is blocked, so the only way it can change is
  browser Back (or the service itself calling `openService`). `useServiceOverlay` watches the
  location and closes the overlay when it changes — a service opened for one employee must not stay
  open over another page.

---

## Contract with the service MFE

The same component must work as a page (`SherutDynamicView`) and in an overlay. It receives:

```ts
interface SherutProps {
  idntSheryut: string;
  employeeId: string;
  /** where it is rendered — lets the MFE drop its own page chrome (title, back button) */
  displayMode: 'page' | 'overlay';
  /** close / leave. Overlay: closes the window. Page: goes back to the portfolio. */
  onClose: () => void;
}
```

- `onClose` is given **in both modes**, so a "save and close" button needs no branching inside the MFE.
- The MFE does **not** render its own window frame, title bar, or close button — the shell does.
- The MFE should fill the height it is given and scroll internally (the overlay body has a fixed height per size).

`SherutDynamicView` changes to pass `displayMode="page"` and `onClose={goBack}`.

---

## The window

```
 viewport (portfolio example)
┌──────────────────────────────────────────────────────────────┐
│ header                                                       │
├──────────────────────────────────────────────────┬───────────┤
│  preview sections (digital objects, tasks, …)    │  side nav │
│  stay rendered underneath — the overlay floats   │           │
│  ON TOP of them, it does not push them           │           │
│  ┌───────────────────────────┐                   │           │
│  │ ⠿ Service title   S M L × │ ← title bar: drag,│           │
│  ├───────────────────────────┤   size, close     │           │
│  │   service MFE             │                   │           │
│  │   (scrolls inside)        │                   │           │
│  └───────────────────────────┘                   │           │
│  ↑ always opens 24px from the left and bottom    │           │
└──────────────────────────────────────────────────┴───────────┘
```

**Placement rules**

- The window is `position: fixed` and rendered in `RouterApp` **outside** the page layout, so it
  floats **above the preview data**. The preview does not move, shrink or reflow.
- A **full-viewport backdrop** sits between the page and the window and swallows every click —
  page, side nav and header are all blocked. The backdrop is **fully transparent** (no dim, no blur):
  the overlay is a draggable window, not a dialog that takes over the screen, so the page must look
  exactly as before. The window itself carries a shadow so it reads as floating.
- It **always opens in the bottom-left corner** of the viewport (24px from left and bottom), every
  time it opens and on every screen width.
- The user may drag it away; that position lasts only until the overlay closes. Next open is
  bottom-left again.

### Sizes

| Size | Width | Height | Note |
|---|---|---|---|
| `s` | 400px | 480px | short forms |
| `m` | 640px | 600px | default |
| `l` | 960px | `min(800px, 100vh − header − 48px)` | |

All three are capped by the viewport. Exact values are placeholders until the design lands in Figma.

The user changes size **only** with the S/M/L switch in the title bar — there is no free resize
by dragging an edge or corner.

Switching size keeps the window's **bottom-left corner** fixed (it grows up and to the right),
then clamps it back into the viewport. The size lives in the overlay store.

### Dragging

- Pointer events on the title bar (`pointerdown` → `setPointerCapture` → `pointermove`), applied as
  `transform: translate(x, y)` — no layout work while dragging, no library.
- Clamped so the title bar can never leave the viewport (the user can always grab it again).
- Buttons inside the title bar don't start a drag.
- Position resets when the overlay closes.

### Layering

| Layer | z-index |
|---|---|
| Page, fixed header | as today |
| **Overlay backdrop** (blocks clicks) | above the header |
| **Service overlay window** | above the backdrop |
| `EmployeePickerPopup` | above the overlay — a service in the overlay may call `openService`, which can open the picker |

### Narrow screens

No special mode — the window still opens in the bottom-left corner. On a viewport smaller than
the chosen size, width and height are capped to the viewport (minus the 24px margins).

### Accessibility

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → the title.
- Focus moves into the overlay on open, **Tab is trapped inside it**, and focus returns to the
  element that opened it on close.
- `Esc` closes.

---

## Files

| File | Change |
|------|--------|
| `shell/src/hooks/useServiceOverlay.ts` | **New** — `useState` for the open service, `showOverlay`, `overlayProps`, auto-close on route change |
| `shell/src/utils/overlayBase.ts` | **New** — `PORTFOLIO_ROOTS`, `overlayBasePath(pathname)` |
| `shell/src/services/openService.ts` | `resolveRoute`: for overlay, return `serviceId`, `params`, `size` instead of a URL |
| `shell/src/hooks/useOpenService.ts` | Takes `showOverlay`; `case 'overlay'`: navigate to the base page if needed, then `showOverlay(...)` |
| `shell/src/components/overlay/ServiceOverlay.tsx` | **New** — backdrop + window frame: title bar, size switch, drag, close, focus trap, loading/error states |
| `shell/src/components/overlay/useDraggable.ts` | **New** — pointer-drag hook with viewport clamping |
| `shell/src/hooks/useSherutModule.ts` | **New** — config (cached → API fallback) + `loadRemoteModule`, shared by page and overlay |
| `shell/src/sections/SherutDynamicView.tsx` | Use `useSherutModule`; pass `displayMode="page"` and `onClose` |
| `shell/src/App.tsx` | Call `useServiceOverlay()`, pass `showOverlay` to `useOpenService`, render `<ServiceOverlay {...overlayProps}/>` before `<EmployeePickerPopup />` |
| `shell/src/types/openService.ts` | `OverlaySize = 's' \| 'm' \| 'l'`; `SherutProps` |
| `mfe-sherut-exemplat/src/App.tsx` | Accept `displayMode` and `onClose`; add a "save and close" example |

---

## Phases

1. **Hook + backdrop** — `useServiceOverlay`, `overlayBasePath`, `resolveRoute`/`useOpenService` changes,
   `ServiceOverlay` rendering the MFE in a plain fixed box over a click-blocking backdrop.
   Proves open / close / move to preview / blocked page / auto-close on Back.
2. **Window** — title bar, S/M/L switch, drag, viewport capping, focus trap.
3. **Contract** — `useSherutModule` extraction, `displayMode` + `onClose` in `SherutDynamicView` and
   `mfe-sherut-exemplat`.

---

## Open questions

None — all decided. The service id is `idntMenuItem` (the same value as `idntSheryut`).

---

## What this does NOT do

- Does not put the overlay in the URL — reload closes it.
- Does not open more than one overlay — a second one shows "יש לסגור קודם את השירות הפתוח".
- Does not support free resize — only S / M / L.
- Does not warn about unsaved changes on close.
- Does not change how `openService` decides **which** service opens — only how an overlay service is displayed.
- Does not let a caller force overlay/page — the service config decides.
- Does not add a global store — overlay state is local to `RouterApp`, and MFEs still only call `openService` and `onClose`.
- Does not support `target=blank` services in an overlay; those still open in a new tab.
