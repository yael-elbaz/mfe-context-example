# Spec: MFE Usage Rating — `idntMfe` first-call header

## Goal

Know which MFE each user actually uses the most.

The metric is **"how many times the user opened the MFE"**, not "how many HTTP requests
the MFE made". So exactly **one** request per MFE per browser tab carries an identifying
header; the server middleware counts those.

---

## Responsibility split

| Layer | Owns |
|---|---|
| `shell/src/services/mfeUsage.ts` | the first-call claim (sessionStorage) + the axios interceptor. Exposed over Module Federation as `shell/mfeUsage`. |
| `<mfe>/src/services/http.ts` | the MFE's own axios instance + its `IDNT_MFE` constant. Calls `attachMfeUsageInterceptor` once. |
| server middleware | reads `X-Idnt-Mfe` off the request and increments the per-user counter. |

The logic lives in the shell because every MFE already consumes shell modules over
federation (`shell/store`, `shell/employeeStore`). One copy, one storage namespace.

---

## Header

```
X-Idnt-Mfe: <idntMfe>
```

Sent **only** on the first request of that MFE in the current tab.

---

## Why sessionStorage

The requirement is "once per MFE per tab". `sessionStorage` is already scoped per tab
and cleared when the tab closes — exactly the desired lifetime. `localStorage` would
count once per browser, forever; an in-memory flag alone would reset on every reload.

Key format: `mfeUsage:firstCall:<idntMfe>` → timestamp.

An in-memory `Set` mirrors the flag so the mechanism still works where `sessionStorage`
throws (private mode, storage-blocked iframes). Without it the interceptor would tag
*every* request in those contexts and inflate the count.

---

## Flow

```
MFE mounts
  │
  ├─ http.get(...)  ──▶ request interceptor
  │                       ├─ config.skipMfeUsage?  ──▶ pass through, no claim
  │                       ├─ claimFirstMfeCall(idntMfe)
  │                       │     already claimed ──▶ pass through
  │                       │     first one       ──▶ set X-Idnt-Mfe, mark config
  │                       └─ send
  │
  └─ response error interceptor
        request carried the header AND there is no response (network down / cancelled)
          ──▶ releaseMfeCall(idntMfe)   // server never saw it; let the next call retry
        4xx/5xx ──▶ claim kept          // the middleware already counted it
```

### Concurrency

`claimFirstMfeCall` runs synchronously start-to-finish, so when an MFE fires several
requests in parallel on mount, only the first one to enter the interceptor wins.

---

## Adding a new MFE

1. `npm install axios`
2. Add `remotes: { shell: 'http://localhost:3000/assets/remoteEntry.js' }` to `vite.config.ts`.
3. Copy the `shell/mfeUsage` block into `src/remotes.d.ts`.
4. Create `src/services/http.ts`:

```ts
import axios from 'axios';
import { attachMfeUsageInterceptor } from 'shell/mfeUsage';

export const IDNT_MFE: string = import.meta.env.VITE_IDNT_MFE ?? 'mfe-my-new-thing';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
});

attachMfeUsageInterceptor(http, IDNT_MFE);
```

5. Route **every** network call of the MFE through `http`. A call made with bare `fetch`
   or with the global `axios` is invisible to the rating.

`IDNT_MFE` defaults to the package name and can be overridden per environment with
`VITE_IDNT_MFE` — use that if the server expects numeric ids (like `idntSheryut`).

---

## Excluding a call

Polling, health checks and anything that fires without the user actually opening the MFE
should not be able to win the claim:

```ts
http.get('/health', { skipMfeUsage: true });
```

---

## Server-side requirements

- CORS: `Access-Control-Allow-Headers` must include `X-Idnt-Mfe`, otherwise the browser
  preflight rejects the tagged request. Note that adding a custom header turns otherwise
  simple `GET`s into preflighted requests.
- The middleware should treat an unknown `idntMfe` as a no-op rather than an error.
- Counting on arrival is intentional: a request that reached the middleware but returned
  5xx still means the user opened the MFE.
