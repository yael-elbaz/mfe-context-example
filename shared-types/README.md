# @org/shared-types

Shared TypeScript types for the MFE platform (shell + all MFEs).

> Replace `@org` with your real npm scope and set the registry URL in `.npmrc` /
> `package.json#publishConfig` before publishing.

## What's inside

| File | Types |
|---|---|
| `person.ts` | `EmployeeProfile`, `CustomerProfile`, `AnyPerson`, `PersonType` |
| `tabs.ts` | `RawMenuParam`, `RawTabConfig`, `TabConfig`, `TabData` |
| `sherut.ts` | `SherutMfeConfig` |

## Build & publish

```bash
npm install
npm run build      # emits dist/*.d.ts (+ empty *.js)
npm publish        # publishes to the registry in .npmrc / publishConfig
```

Bump the version on every type change, then publish.

## Consume

### In a real MFE repo (production)
```jsonc
// package.json
"dependencies": { "@org/shared-types": "^1.0.0" }
```
```ts
import type { EmployeeProfile, TabConfig } from '@org/shared-types';
```
Resolved through `node_modules` — works across separate repos, no tsconfig `paths` needed.

### Locally in this monorepo (development)
```jsonc
"dependencies": { "@org/shared-types": "file:../shared-types" }
```
or `npm link`. Then import the same way.
