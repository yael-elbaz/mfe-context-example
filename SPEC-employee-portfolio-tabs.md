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
[3] Determine active tab
    If mfeConfig.selectedActiveTab exists
      → find tab where id === selectedActiveTab (IDNT_MENU_ITEM)
    Else
      → tab with lowest order
    │
    ▼
[4] Fetch active tab data
    GET {tab.dataUrl}employeeId={employeeId}
    │
    ▼
[5] Render: tabs bar (each tab styled with its own color) + active tab content
    On tab click → fetch that tab's dataUrl + set active
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

## Tab Data Fetch

```
GET {tab.dataUrl}employeeId={employeeId}
```

- `dataUrl` already contains the base path (e.g. `api-emp.il/.../GetDetails?`)
- Append `employeeId=` directly to the URL
- `LOGI_PARTIAL_URL` is **ignored** — use the URL as-is
- Returns: `TabData`

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

## `SherutMfeConfig` — required addition

Add `selectedActiveTab` to the existing interface:

```typescript
// shell/src/services/sherutimService.ts
export interface SherutMfeConfig {
  remoteUrl: string;
  scope: string;
  module: string;
  objectType: PersonType[] | null;
  selectedActiveTab?: number;   // IDNT_MENU_ITEM of the tab to open by default
}
```

---

## MFE Props

```typescript
// mfe-employee-portfolio/src/App.tsx
interface Props {
  openService?: OpenService;
  navigate?: (to: string) => void;
  mfeConfig?: SherutMfeConfig | null;
}
```

`mfeConfig.selectedActiveTab` is an `IDNT_MENU_ITEM` number, matched against `tab.id` to override the default active tab.

---

## Component Responsibilities

| Layer | Responsibility |
|---|---|
| `EmployeePortfolioLayout` (shell) | Passes `employeeId`, `mfeConfig` to MFE as props |
| `App.tsx` (MFE) | Fetches tabs config, normalizes, resolves active tab, fetches tab data, renders UI |
| `TabsBar` (new component in MFE) | Renders tab list; each tab is always styled with its own `tab.color`; active tab gets a border in that same color to indicate selection |
| `TabContent` (new component in MFE) | Renders `TabData` — four sections (`basicData`, `murchavData`, `hatrraa`, `links`), each as key/value rows |

---

## Tab Visual Behavior

| State    | Styling                                              |
|----------|------------------------------------------------------|
| Inactive | Tab label/icon rendered in `tab.color`               |
| Active   | Tab label/icon in `tab.color` + border in `tab.color` |

The border is the visual indicator of the selected tab — no other background fill change is required.

---

## Error States

- If the tabs config fetch fails → show `"שגיאה בטעינת נתונים"` on the employee card in place of the tabs
- If a tab data fetch fails → show `"שגיאה בטעינת נתונים"` in the tab content area

---

## `LOGI_PNIMI`

Ignored. All tabs behave identically regardless of this flag.
