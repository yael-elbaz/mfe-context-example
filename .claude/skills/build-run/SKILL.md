---
name: build-run
description: Build and start the entire mfe-context-example application in the correct order. Use when the user wants to run the project, rebuild after changes, or restart servers.
---

> **Permission note:** The user has pre-approved all Bash and PowerShell commands in this skill.
> Run every command below without asking for confirmation.

# Build & Run — mfe-context-example

You are about to start all 7 services for this Webpack 5 + Module Federation project.
Follow the steps below **in order**.

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

## Dev mode supports Module Federation

Unlike the old Vite setup, `webpack serve` (dev mode) fully supports
`ModuleFederationPlugin` with HMR for both the host and the remotes. There is
**no build-order dependency** anymore — every package can be started with
`npm run dev` in any order. Each `remoteEntry.js` is served live by its own
dev server and resolved by consumers at runtime in the browser.

---

## Step 1 — Install dependencies

**Automatically skip installation if node_modules already exists.** Do not ask the user - just check and proceed.

Check each package directory and run `npm install` only where `node_modules` is missing.
Run these sequentially so output is readable:

```bash
cd c:/Users/user1/Documents/clode-design/mfe-context-example
for dir in shell mfe-tasks mfe-search-employee mfe-employee-portfolio mfe-digital-objects mfe-sherut-exemplat mfe-sherutim; do
  if [ ! -d "$dir/node_modules" ]; then
    echo "==> Installing $dir..."
    (cd "$dir" && npm install)
  else
    echo "✓ $dir — node_modules already present"
  fi
done
```

---

## Step 2 — Start all dev servers

Start each server in the background with `run_in_background: true` on the Bash tool.
Order doesn't matter, but starting the shell first is convenient since it's the one
the user will open in the browser.

1. `cd shell && npm run dev`                     → http://localhost:3000
2. `cd mfe-tasks && npm run dev`                 → http://localhost:3001
3. `cd mfe-search-employee && npm run dev`       → http://localhost:3002
4. `cd mfe-employee-portfolio && npm run dev`    → http://localhost:3003
5. `cd mfe-digital-objects && npm run dev`       → http://localhost:3004
6. `cd mfe-sherut-exemplat && npm run dev`       → http://localhost:3005
7. `cd mfe-sherutim && npm run dev`              → http://localhost:3006

After launching all 7 background processes, run a quick health-check (webpack-dev-server
takes a few seconds to compile on first start, so allow some time before checking):

```bash
sleep 5
for port in 3000 3001 3002 3003 3004 3005 3006; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port | grep -q "200\|304"; then
    echo "✓ :$port is up"
  else
    echo "✗ :$port not responding"
  fi
done
```

Then tell the user: **Open http://localhost:3000 in the browser.**

Code changes to any package are picked up live via HMR — no rebuild/restart needed
unless `webpack.config.cjs`, `package.json`, or other build config files change.

---

## Step 3 — Verify the dynamic sherut feature works

Tell the user to test the dynamic federation flow:
1. On the home page, search for an employee and click their name.
2. In the employee portfolio, find the **שירותים דיגיטליים** section.
3. Click any sherut card — the page should navigate to `/employee-portfolio/tik-asir/sherutim/SHRxxx`.
4. The loading indicator (2 phases) should appear briefly, then the `mfe-sherut-exemplat` component loads.
5. The 🔌 badge at the bottom of the sherut card confirms the MFE was loaded from `:3005`.

This flow uses webpack's dynamic-remotes pattern (`shell/src/utils/dynamicFederation.ts`):
a `<script>` tag is injected for `mfe-sherut-exemplat`'s `remoteEntry.js`, then the
exposed `./App` module is pulled from the resulting `window.mfe_sherut_exemplat` container.

---

## Stopping all servers

```bash
pkill -f "webpack serve"
```

Or if on Windows without pkill:

```powershell
Get-Process -Name node | Where-Object { $_.MainWindowTitle -eq '' } | Stop-Process
```

---

## Production build (optional verification)

To verify production builds still work, run in each package:

```bash
cd c:/Users/user1/Documents/clode-design/mfe-context-example
for dir in shell mfe-tasks mfe-search-employee mfe-employee-portfolio mfe-digital-objects mfe-sherut-exemplat mfe-sherutim; do
  echo "==> Building $dir..."
  (cd "$dir" && npm run build)
  echo "✓ $dir built"
done
```

Each package's `dist/assets/remoteEntry.js` should be produced, matching the same
paths used in dev mode.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Blank page or "Failed to fetch dynamically imported module" | Wrong port, CORS, or that dev server isn't up yet | Make sure all 7 dev servers are running and finished compiling |
| Sherut MFE shows error state | `mfe-sherut-exemplat` not running on :3005 | Run `cd mfe-sherut-exemplat && npm run dev` |
| Changes not reflected | HMR didn't pick up the change (rare) | Restart that package's `npm run dev` |
| `Module not found: Error: Can't resolve 'shell/store'` etc. at dev time | Shell dev server not running | Start `shell` (`npm run dev`) — remotes are resolved live in the browser, not at build time |
