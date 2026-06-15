# SPEC: shared-types package (published npm package)

## Status: APPROVED — scaffolding

## Goal

A single shared package of TypeScript types that the shell and every MFE import — so all
projects agree on the same type definitions instead of duplicating them.

## Critical constraint — MFEs live in SEPARATE repos

In production each MFE is its **own git repo** (this example is a monorepo only for demo).
Therefore type-sharing via tsconfig `paths` (e.g. `../shell/src/...`) **does not work** —
there is no sibling source folder across repos. The package must be a **real, published npm
package** resolved through `node_modules`, like any other dependency.

> Types are still erased at runtime — no Module Federation needed. This is purely a
> compile-time dependency consumed via the npm registry.

---

## Package shape

```
shared-types/
  package.json        # @org/shared-types, builds .d.ts to dist/
  tsconfig.json       # declaration: true → emits dist/*.d.ts (+ empty *.js)
  .npmrc              # points to the private registry (URL filled by you, not committed)
  .gitignore          # dist, node_modules
  README.md
  src/
    index.ts          # re-exports everything
    person.ts         # EmployeeProfile, CustomerProfile, AnyPerson, PersonType
    tabs.ts           # RawMenuParam, RawTabConfig, TabConfig, TabData
    sherut.ts         # SherutMfeConfig
```

`package.json` essentials:
```jsonc
{
  "name": "@org/shared-types",      // ← replace @org with your real scope
  "version": "1.0.0",
  "types": "dist/index.d.ts",
  "main": "dist/index.js",
  "files": ["dist"],
  "scripts": { "build": "tsc", "prepublishOnly": "npm run build" },
  "publishConfig": { "registry": "<<YOUR_PRIVATE_REGISTRY_URL>>" }
}
```

---

## Publish flow (per change)

```
edit a type → bump version → npm run build → npm publish
```
Each consumer repo then `npm install @org/shared-types@latest`.

## Consuming

### In a real MFE repo (production)
```jsonc
// package.json
"dependencies": { "@org/shared-types": "^1.0.0" }
```
```ts
import type { EmployeeProfile, TabConfig } from '@org/shared-types';
```
Resolved via `node_modules` — **no `paths`, restart-proof, works across repos.**

### Locally in this monorepo (for development/demo)
Link without publishing:
```
"dependencies": { "@org/shared-types": "file:../shared-types" }
```
(or `npm link`). Then the same `import type { … } from '@org/shared-types'`.

---

## Registry config (`.npmrc`)

The private registry URL is **not committed**. Each repo gets an `.npmrc`:
```
@org:registry=<<YOUR_PRIVATE_REGISTRY_URL>>
//<<registry-host>>/:_authToken=${NPM_TOKEN}
```
Auth token comes from an env var / CI secret — never hardcoded.

---

## Migration (incremental, after the package exists)

Canonical definitions move into `shared-types`; existing files re-export to avoid breakage:

- `shell/src/store/personStore.ts` → imports the person **types** from `@org/shared-types`,
  keeps its runtime `create(...)` store, and re-exports the types for current consumers.
- `mfe-employee-portfolio/src/types.ts` → re-exports tab types from `@org/shared-types`.
- `shell/src/services/sherutimService.ts` → imports `SherutMfeConfig` from the package.

Done one consumer at a time; nothing breaks because old import paths keep re-exporting.

---

## Scope of this pass

1. Scaffold `shared-types/` with the real shared types (person, tabs, sherut).
2. Provide `.npmrc`/`publishConfig` placeholders for your private registry.
3. **Not** migrating consumers yet — that's a follow-up once you confirm the package builds
   and publishes in your environment.
