# SPEC: EmployeePortfolioMFE — Design

## Status: DRAFT — filling in precise values

Companion to [SPEC-employee-portfolio-tabs.md](SPEC-employee-portfolio-tabs.md) (structure &
data). This file holds the **visual design** only — colors, typography, spacing, sizing.

> Convention: **CURRENT** = the placeholder value implemented today. **TARGET** = the final
> Figma value to apply (TBD until you supply it). Where TARGET is empty, CURRENT stands.

---

## Global

| Token | CURRENT | TARGET (TBD) |
|---|---|---|
| Font family | `Rubik, Arial, sans-serif` | |
| Direction | `rtl` | |
| Card background | `#FFFFFF` | |
| Card radius | `12px` (`rounded-xl`) | `8px` |
| Card shadow | `0 2px 12px rgba(0,0,0,0.10)` | |

### Color palette (from CLAUDE.md)

| Name | Hex |
|---|---|
| Navy (primary text) | `#00033D` |
| Blue 2 | `#1E3BA2` |
| Navy icon | `#1B2B6B` |
| Muted gray | `#848282` |
| Hover/bg light | `#F8F9FD` |
| Panel bg | `#F0F2F8` |
| Border light | `#E8EAF0` |

---

## Region 1 — Main row (collapsed)

`[ avatar (right) ]  [ active tab basicData columns ]  [ ← back ]  [ ⌄ expand ]`

| Element | CURRENT | TARGET |
|---|---|---|
| Row background | `#FFFFFF` | `#FFFFFF` |
| Row width | `100%` | `100%` |
| Row height | `56px` (min) | `116px` (fixed) |
| Row padding | `px-4 py-2` | `24px` |
| Row gap | `16px` (`gap-4`) | `16px` |
| Row radius | — | `8px` |
| **Avatar** size | `32×32` (`w-8 h-8`), circle | `80×80`, circle, `1px solid #00033D` |
| Avatar name text | `14px`, `#1E3BA2`, semibold | |
| Avatar sub text | `11px`, `#848282` | |
| **Basic-data label** | `12px`, `#9AA0AE` | Rubik `400`, `14px`, `#8E929F`, line-height `125%`, right |
| **Basic-data value** | `13px`, `#1B2B6B`, medium | Rubik `400`, `16px`, `#00033D`, line-height `125%`, right |
| Column gap (x / y) | `32px` / `8px` | |
| **Back button** | `12px`, `#848282` | |
| **Expand icon** | `28×28` circle, bg `#F0F2F8`, glyph `▼` `#1B2B6B` | |

---

## Region 2 — Tab strip (expanded)

Horizontal scrollable row of tab cards + left/right arrows on overflow.

| Element | CURRENT | TARGET (TBD) |
|---|---|---|
| Strip gap | `8px` (`gap-2`) | |
| **Card** padding | `px-3 py-2` | |
| Card radius | `8px` (`rounded-lg`) | |
| Card border (idle) | `1px #E8EAF0` | |
| Card border (selected) | `1px tab.color` | |
| Card right accent | `4px tab.color` | |
| Card bg (idle) | `#FFFFFF` | |
| Card bg (selected) | `tab.color` @ ~8% (`${color}14`) | |
| Card title | `13px`, `tab.color`; selected = semibold | |
| Card icon | `16×16` (`w-4 h-4`) | |
| **Arrow button** | `24×24` circle, bg `#F0F2F8`, `#1B2B6B` | |

---

## Region 3 — Data panel (selected card content)

Sections: `basicData` (נתונים בסיסיים), `hatrraa` (התראות), `murchavData` (נתונים מורחבים),
`links` (קישורים).

| Element | CURRENT | TARGET (TBD) |
|---|---|---|
| Panel border | `1px #E8EAF0`, radius `8px`, padding `12px` | |
| Section title | `10px`, `#848282`, uppercase, `0.4px` tracking | |
| Section gap | `8px` | |
| **Key/value chip** | bg `#F8F9FD`, radius `4px`, `px-[6px] py-[2px]` | |
| chip label | `10px`, `#848282` | |
| chip value | `11px`, `#00033D`, medium | |
| **Link** | `12px`, `#1E3BA2` | |
| **Alert (hatrraa)** chip | bg `#FFF0CC`, border `#FFD580`, text `#7A4F00`, `11px`, `⚠` prefix | |

---

## Approach

- Values supplied as **Figma CSS dumps, per region**. I fill the `TARGET` column from your
  paste and then apply it to the Tailwind classes.
- Region order: **Main row → Tab strip → Data panel**.

### Progress
- [ ] Region 1 — Main row (awaiting Figma CSS)
- [ ] Region 2 — Tab strip
- [ ] Region 3 — Data panel
