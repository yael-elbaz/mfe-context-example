# SPEC: EmployeePortfolioMFE — Tabs Architecture

## Status: READY FOR REVIEW

---

## Overview

The `EmployeePortfolioMFE` card displays a tabbed interface. Each tab represents a job/service the employee is connected to (present or past). Tabs are driven by a config API; each tab knows its own data URL from which it fetches its content.

---

## Data Flow

```
employeeId
    │
    ▼
[1] Fetch tabs config
    GET {TABS_CONFIG_API}?employeeId={employeeId}
    │
    ▼
[2] Parse + normalize each RawTabConfig → TabConfig
    Sort by order ASC
    │
    ▼
[3] Prefetch ALL tab data in parallel (Promise.allSettled)
    For each tab → GET {tab.dataUrl}employeeId={employeeId}
    │
    ▼
[4] Filter tabs
    Drop any tab whose data fetch rejected OR returned empty
    (all four sections empty) → that tab is never shown
    │
    ▼
[5] Determine active tab (from the visible tabs only)
    If extendedTabDataUrl present
      → the "more data" tab is active
    Else if selectedActiveTab exists
      → find tab where id === selectedActiveTab (IDNT_MENU_ITEM)
    Else
      → tab with lowest order
    │
    ▼
[6] Render: tabs bar (each tab styled with its own color) + active tab content
    On tab click → data is already cached → switch instantly, no fetch
```

---

## Raw API Shape (`RawTabConfig`)

The tabs config API returns an array of objects with this shape:

```typescript
interface RawMenuParam {
  CODE_SUG_PARAMETER: string;
  PARAMETER_KEY: string;
  PARAMETER_VALUE: string;
}

interface RawTabConfig {
  CODE_SUG_OBJECT: number;
  ICON_URL: string;
  IDNT_MENU_ITEM: number;         // unique tab ID
  IDNT_MENU_ITEM_AV: string;
  IDNT_OBJECT: string;
  LOGI_HTTPS: boolean;
  LOGI_PARTIAL_ICON_URL: boolean;
  LOGI_PARTIAL_URL: boolean;      // ignored — use Getdata URL as-is
  LOGI_PNIMI: boolean;            // true = internal tab
  LOGI_SUG_OBJECT_MISMACH: boolean;
  Menu_Params_list: RawMenuParam[];
  OPEN_IN_IE: boolean;
  ORDER_BY: string;
  TEXT_MENU: string;
  TEXT_MENU_ITEM: string;         // display name
  TEXT_MENU_TARGET: string;
  TEXT_NATIV: string;
  TEXT_OBJECT_NAME: string;       // component identifier — used for active tab matching
  TEXT_OPERATION: string;
}
```

### `Menu_Params_list` — keys used

| `PARAMETER_KEY` | Meaning             | Notes                        |
|-----------------|---------------------|------------------------------|
| `COLOR`         | Tab accent color    | e.g. `#00A870`               |
| `Getdata`       | Data fetch URL      | Append `employeeId=` param   |
| `ORDER`         | Sort order          | Parse as `number`            |
| `TITLE`         | Tab display label   | e.g. `"אלמ'ב"`               |

---

## Normalized Type (`TabConfig`)

```typescript
interface TabConfig {
  id: number;            // IDNT_MENU_ITEM
  objectName: string;    // TEXT_OBJECT_NAME — used for selectedActiveTab matching
  displayName: string;   // TEXT_MENU_ITEM
  title: string;         // Menu_Params_list[TITLE]
  color: string;         // Menu_Params_list[COLOR]
  order: number;         // Menu_Params_list[ORDER] parsed as number
  dataUrl: string;       // Menu_Params_list[Getdata]
  iconUrl: string;       // ICON_URL
  isInternal: boolean;   // LOGI_PNIMI
}
```

### Normalization logic

```typescript
function normalizeTab(raw: RawTabConfig): TabConfig {
  const getParam = (key: string) =>
    raw.Menu_Params_list.find(p => p.PARAMETER_KEY === key)?.PARAMETER_VALUE ?? '';

  return {
    id: raw.IDNT_MENU_ITEM,
    objectName: raw.TEXT_OBJECT_NAME,
    displayName: raw.TEXT_MENU_ITEM,
    title: getParam('TITLE'),
    color: getParam('COLOR'),
    order: Number(getParam('ORDER')),
    dataUrl: getParam('Getdata'),
    iconUrl: raw.ICON_URL,
    isInternal: raw.LOGI_PNIMI,
  };
}
```

---

## Tabs Config API

```
GET {TABS_CONFIG_API}?employeeId={employeeId}
```

> The endpoint URL is sensitive and stored in an environment variable / secure config. The code references it via a constant (`TABS_CONFIG_URL`) — do not hardcode it.

Returns: `RawTabConfig[]`

---

## Tab Data Response Shape (`TabData`)

All tabs return the **same structure** from their `dataUrl`:

```typescript
interface TabData {
  basicData:   Record<string, string>;  // נתונים בסיסיים
  murchavData: Record<string, string>;  // נתונים מורחבים
  hatrraa:     Record<string, string>;  // התראות
  links:       Record<string, string>;  // קישורים
}
```

Each section is a flat `{ [label: string]: string }` map — rendered as key/value rows.

---

## Tab Data Fetch — Prefetch All Up Front

All tab data is fetched **once, in parallel**, immediately after the tabs config loads
(not lazily on tab click).

```
For each tab (in parallel via Promise.allSettled):
  GET {tab.dataUrl}employeeId={employeeId}
```

- `dataUrl` already contains the base path (e.g. `api-emp.il/.../GetDetails?`)
- Append `employeeId=` directly to the URL
- `LOGI_PARTIAL_URL` is **ignored** — use the URL as-is
- Returns: `TabData`

Results are stored in a `Record<tabId, TabData>` map. Clicking a tab just switches the
active id — the data is already cached, so there is **no per-click fetch** and no per-tab
loading/error state.

### Hide empty / failed tabs

After the parallel fetch, a tab is **dropped from the bar entirely** when:
- its data fetch **rejected**, or
- its data is **empty** — all four sections (`basicData`, `murchavData`, `hatrraa`,
  `links`) have zero entries.

Only tabs with non-empty data are shown, and the active tab is resolved from that visible
set.

---

## Active Tab Logic

```typescript
function resolveActiveTab(tabs: TabConfig[], selectedActiveTab?: number): TabConfig | null {
  if (!tabs.length) return null;

  if (selectedActiveTab != null) {
    const match = tabs.find(t => t.id === selectedActiveTab);
    if (match) return match;
  }

  // fallback: lowest order
  return tabs.reduce((min, t) => t.order < min.order ? t : min, tabs[0]);
}
```

---

## `SherutMfeConfig` — required additions

```typescript
// shell/src/services/sherutimService.ts

export interface SherutMfeConfig {
  remoteUrl: string;
  scope: string;
  module: string;
  objectType: PersonType[] | null;
  selectedActiveTab?: number;  // IDNT_MENU_ITEM of the tab to open by default
  extendedTabDataUrl?: string;        // data URL for the "more data" tab (only the URL varies)
}
```

The sherut config passes **only the data URL** for the "more data" tab. Everything else
about that tab (label, color, order, and the fact that it is always the active tab) is a
fixed constant inside the MFE — the sherut cannot change it.

---

## "More Data" Tab — Synthetic Tab Injection

The MFE owns the fixed config for this tab. Only its `dataUrl` is supplied per-sherut via
`mfeConfig.extendedTabDataUrl`:

```typescript
// mfe-employee-portfolio/src/tabsConfig.ts
const SYNTHETIC_MORE_DATA_TAB_ID = -1; // reserved ID, never returned by the real API

export const MORE_DATA_TAB = {
  label: 'מידע נוסף',
  color: '#7B2FBE',
  order: Infinity, // always rendered last in the bar
} as const;

export function buildMoreDataTab(dataUrl: string): TabConfig {
  return {
    id: SYNTHETIC_MORE_DATA_TAB_ID,
    objectName: 'moreData',
    displayName: MORE_DATA_TAB.label,
    title: MORE_DATA_TAB.label,
    color: MORE_DATA_TAB.color,
    order: MORE_DATA_TAB.order,
    dataUrl,
    iconUrl: '',
    isInternal: false,
  };
}
```

When `extendedTabDataUrl` is present, the MFE appends `buildMoreDataTab(extendedTabDataUrl)` to the
normalized tabs array after fetching the tabs config, then re-sorts by `order`. The tab is
fetched and rendered identically to any API-driven tab — no special casing in `TabsBar` or
`TabContent`.

---

## Active Tab Resolution — Updated Logic

The "more data" tab, **when present, is always the active tab**. The resolution order is:

```
1. extendedTabDataUrl present
      → activate the synthetic "more data" tab (id = SYNTHETIC_MORE_DATA_TAB_ID)

2. selectedActiveTab != null
      → find tab where tab.id === selectedActiveTab

3. fallback
      → tab with lowest order
```

```typescript
function resolveActiveTab(
  tabs: TabConfig[],
  selectedActiveTab?: number,
  hasMoreDataTab?: boolean,
): TabConfig | null {
  if (!tabs.length) return null;

  if (hasMoreDataTab) {
    const synthetic = tabs.find(t => t.id === SYNTHETIC_MORE_DATA_TAB_ID);
    if (synthetic) return synthetic;
  }

  if (selectedActiveTab != null) {
    const match = tabs.find(t => t.id === selectedActiveTab);
    if (match) return match;
  }

  return tabs.reduce((min, t) => t.order < min.order ? t : min, tabs[0]);
}
```

---

## MFE Props

```typescript
// mfe-employee-portfolio/src/App.tsx
interface Props {
  navigate?: (to: string) => void;
  extendedTabDataUrl?: string | null;   // data URL for the "more data" tab
  selectedActiveTab?: number;    // IDNT_MENU_ITEM to open by default
}
```

The shell flattens `SherutMfeConfig` into individual props (`extendedTabDataUrl`, `selectedActiveTab`) when rendering the MFE — the MFE does not receive the whole config object.

`selectedActiveTab` is an `IDNT_MENU_ITEM` number, matched against `tab.id` to override the default active tab. When `extendedTabDataUrl` is present, the "more data" tab is always active and takes priority over `selectedActiveTab`.

---

## Component Layout (v2 — accordion)

> **Structure implemented with placeholder styling.** The component tree and interaction
> below are built; final CSS will be supplied separately and dropped into the existing
> Tailwind classes.

### Collapsed (default)

A single **main row** showing the **active tab's `basicData`**:

```
[ ←back ]  [ value  value  value  value  …  (active tab basicData, RTL columns) ]  [ avatar ]  [ ⌄ expand ]
```

- Avatar stays on the right; `←` back button stays.
- The middle is the active tab's `basicData` rendered as horizontal label-over-value columns
  (as in the reference screenshot).
- The tabs bar is **not** shown in this state.
- An **expand icon** sits at the end of the row.

### Expanded (after clicking the expand icon)

A **horizontal, scrollable strip** of tab cards, with the **selected card's data shown in a
panel below the strip**.

- Every tab — including the active one — is a card laid out in a **row** (not stacked).
- When the cards overflow the width, **left/right arrows** appear to scroll the row.
- Selecting a card shows **all four** sections of that tab's `TabData`
  (`basicData`, `murchavData`, `hatrraa`, `links`) in the panel beneath.
- Only one card is selected at a time; the active tab is selected by default when the panel
  expands.
- Each card is styled with its tab's own `tab.color`.

---

## Component Responsibilities

| Layer | Responsibility |
|---|---|
| `EmployeePortfolioLayout` (shell) | Flattens `mfeConfig` → passes `navigate`, `extendedTabDataUrl`, `selectedActiveTab` to MFE as props |
| `App.tsx` (MFE) | Fetches tabs config, normalizes, resolves active tab, prefetches all data, renders main row + accordion |
| Main row (MFE) | Renders avatar (right) + active tab's `basicData` as horizontal columns + back + expand icon |
| `TabStrip` (MFE) | Horizontal scrollable row of tab cards; shows left/right scroll arrows on overflow; highlights the selected card in `tab.color` |
| `TabContent` (MFE) | Renders the selected tab's `TabData` — four sections (`basicData`, `murchavData`, `hatrraa`, `links`), shown in the panel below the strip |

---

## Error States

- If the tabs config fetch fails → show `"שגיאה בטעינת נתונים"` on the employee card in place of the tabs
- If a single tab's data fetch fails → that tab is silently dropped from the bar (same as an empty tab); the rest still render. There is no per-tab error state, since data is prefetched in parallel and tabs are only shown once their data is known.

---

## `LOGI_PNIMI`

Ignored. All tabs behave identically regardless of this flag.
