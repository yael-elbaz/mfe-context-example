---
name: build-run
description: Build and start the entire mfe-context-example application in the correct order. Use when the user wants to run the project, rebuild after changes, or restart servers.
---

> **Permission note:** The user has pre-approved all Bash and PowerShell commands in this skill.
> Run every command below without asking for confirmation.

# Build & Run — mfe-context-example

You are about to build and start all 7 services for this Vite + Module Federation project.
Follow the steps below **in order**. Do not skip steps.

---

## Port map

| Service                | Directory               | Port |
|------------------------|-------------------------|------|
| shell (host)           | `shell/`                | 3000 |
| mfe-tasks              | `mfe-tasks/`            | 3001 |
| mfe-search-employee    | `mfe-search-employee/`  | 3002 |
| mfe-employee-portfolio | `mfe-employee-portfolio/` | 3003 |
| mfe-digital-objects    | `mfe-digital-objects/`  | 3004 |
| mfe-sherut-exemplat    | `mfe-sherut-exemplat/`  | 3005 |
| mfe-sherutim           | `mfe-sherutim/`         | 3006 |

---

## Why the order matters (from the README)

- **shell must always be built before the MFEs.**
  All MFEs import shared Zustand stores (`shell/store`, `shell/employeeStore`) via
  Module Federation. The shell's `remoteEntry.js` must exist on disk before any MFE
  build starts, otherwise the MFE build will fail trying to resolve those imports.

- **`vite dev` does NOT support Module Federation** with `@originjs/vite-plugin-federation`.
  Always use `vite build` followed by `vite preview`. Never use `vite dev` for this project.

---

## Step 0 — After a `git pull`, check for stale builds

`vite preview` serves static files from `dist`. A pull replaces **source** files and builds nothing,
so the browser keeps serving the previous build with no visible sign that it is out of date.
This looks exactly like "my change didn't work".

Run this first whenever the repo changed. Rebuild every package it flags:

```bash
cd "$(git rev-parse --show-toplevel)"
for d in shell mfe-tasks mfe-search-employee mfe-employee-portfolio mfe-digital-objects mfe-sherut-exemplat mfe-sherutim; do
  s=$(find "$d/src" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) -printf '%T@\n' 2>/dev/null | sort -rn | head -1 | cut -d. -f1)
  b=$(find "$d/dist" -name "*.js" -printf '%T@\n' 2>/dev/null | sort -rn | head -1 | cut -d. -f1)
  if [ -z "$b" ]; then echo "✗ $d — no dist, must build"
  elif [ "$s" -gt "$b" ]; then echo "✗ $d — STALE, source is newer than build"
  else echo "✓ $d — build is current"; fi
done
```

---

## Step 1 — Install dependencies

**Skip installation only when dependencies are actually complete.** Do not ask the user — check and proceed.

A present `node_modules` is **not** proof that the declared dependencies are installed. A stale
`node_modules` that predates a `package.json` change will be missing packages, and the build then
fails with `Rollup failed to resolve import "<pkg>"`. `npm ls --depth=0` catches that; a directory
existence check does not.

```bash
cd "$(git rev-parse --show-toplevel)"
for dir in shell mfe-tasks mfe-search-employee mfe-employee-portfolio mfe-digital-objects mfe-sherut-exemplat mfe-sherutim; do
  if [ ! -d "$dir/node_modules" ] || ! (cd "$dir" && npm ls --depth=0 >/dev/null 2>&1); then
    echo "==> Installing $dir..."
    (cd "$dir" && npm install)
  else
    echo "✓ $dir — dependencies present"
  fi
done
```

---

## Step 2 — Build the shell (MUST be first)

> **Windows: stop the preview server before rebuilding.**
> A running `vite preview` holds an open handle on the files in `dist`, and the build fails with
> `Permission denied` or `EPERM`. Stop the server for that port, build, then start it again.
> This applies to every package, not just the shell.
>
> ```powershell
> Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
> ```

```bash
cd "$(git rev-parse --show-toplevel)/shell"
npm run build
```

Wait for this to finish and confirm `dist/assets/remoteEntry.js` was created before moving on.

---

## Step 3 — Build all MFEs

Build each MFE. Run them one by one so errors are clearly attributed:

If only some MFEs were flagged stale in Step 0, rebuild just those — stop their preview servers first
(ports 3001–3006, see the Windows note in Step 2).

```bash
cd "$(git rev-parse --show-toplevel)"
for dir in mfe-tasks mfe-search-employee mfe-employee-portfolio mfe-digital-objects mfe-sherut-exemplat mfe-sherutim; do
  echo "==> Building $dir..."
  (cd "$dir" && npm run build)
  echo "✓ $dir built"
done
```

---

## Step 4 — Start all preview servers

Start each server in the background with `run_in_background: true` on the Bash tool.
Launch them all, then confirm each port is listening.

Start in this order (shell first, then MFEs):

1. `cd shell && npm run preview`            → http://localhost:3000
2. `cd mfe-tasks && npm run preview`        → http://localhost:3001
3. `cd mfe-search-employee && npm run preview` → http://localhost:3002
4. `cd mfe-employee-portfolio && npm run preview` → http://localhost:3003
5. `cd mfe-digital-objects && npm run preview`    → http://localhost:3004
6. `cd mfe-sherut-exemplat && npm run preview`    → http://localhost:3005
7. `cd mfe-sherutim && npm run preview`           → http://localhost:3006

After launching all 7 background processes, run a quick health-check:

```bash
sleep 3
for port in 3000 3001 3002 3003 3004 3005 3006; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port | grep -q "200\|304"; then
    echo "✓ :$port is up"
  else
    echo "✗ :$port not responding"
  fi
done
```

Then tell the user: **Open http://localhost:3000 in the browser.**

---

## Step 5 — Verify the dynamic sherut feature works

Tell the user to test the new dynamic federation flow:
1. On the home page, search for an employee and click their name.
2. In the employee portfolio, find the **שירותים דיגיטליים** section.
3. Click any sherut card — the page should navigate to `/employee-portfolio/tik-asir/sherutim/SHRxxx`.
4. The loading indicator (2 phases) should appear briefly, then the `mfe-sherut-exemplat` component loads.
5. The 🔌 badge at the bottom of the sherut card confirms the MFE was loaded from `:3005`.

---

## Stopping all servers

```bash
pkill -f "vite preview"
```

Or if on Windows without pkill:

```powershell
Get-Process -Name node | Where-Object { $_.MainWindowTitle -eq '' } | Stop-Process
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| **Code changes don't show in the browser after a `git pull`** | A pull updates source but builds nothing — `vite preview` still serves the old `dist` | Run the Step 0 staleness check, rebuild what it flags, hard-reload (Ctrl+F5) |
| Build fails with `Permission denied` / `EPERM` writing to `dist` | Windows: the running `vite preview` holds the files open | Stop that port's server, rebuild, restart it (Step 2 note) |
| Build fails with `Rollup failed to resolve import "<pkg>"` | `node_modules` exists but is stale — the package was added to `package.json` later | `npm install` in that package; Step 1's `npm ls` check prevents this |
| MFE build fails with "Cannot find module 'shell/store'" | Shell not built yet | Run Step 2 first |
| Blank page or "Failed to fetch dynamically imported module" | Wrong port or CORS | Make sure all 7 preview servers are running |
| Sherut MFE shows error state | `mfe-sherut-exemplat` not running on :3005 | Run `cd mfe-sherut-exemplat && npm run build && npm run preview` |
| Changes to shell code not reflected | Shell not rebuilt | Re-run Step 2, then Step 3 for affected MFEs |
| Changes to an MFE not reflected | That MFE not rebuilt | Re-run `npm run build && npm run preview` inside that MFE directory |
