# Vite App Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `apps/vite-app` as a reusable Vite + React + TypeScript starter that works inside the `vyductan-react` monorepo, uses `@acme/ui`, and follows the approved `~/*` + lowercase `src/app/app.tsx` design.

**Architecture:** Create one small app package with its own `package.json`, Vite config, split TypeScript configs, and app-local ESLint config. Keep runtime code to three files (`src/main.tsx`, `src/app/app.tsx`, `src/styles/globals.css`), reuse the current `@acme/ui` Tailwind import pattern, and keep the starter static and provider-free. Because the approved scope intentionally excludes a test runner, use failing workspace verification commands as the red step and turn them green with the smallest config and source changes.

**Tech Stack:** pnpm, Turborepo, Vite, React 19, TypeScript, Tailwind CSS v4, ESLint, Prettier

---

## File Structure

### Files to create
- `apps/vite-app/package.json`
  - Defines the new workspace package name (`vite-app`), scripts, and dependencies.
- `apps/vite-app/eslint.config.ts`
  - Minimal package-local lint entrypoint so `pnpm --filter vite-app lint` works with `@acme/eslint-config/base` and `@acme/eslint-config/react`, matching the existing app pattern.
- `apps/vite-app/index.html`
  - Provides the Vite HTML entry and `#root` mount node.
- `apps/vite-app/tsconfig.json`
  - Root TypeScript project reference file for `tsc -b`.
- `apps/vite-app/tsconfig.app.json`
  - Browser/React compiler options plus `~/*` and, if required by the current workspace package layout, the same minimal `@acme/ui/*` compatibility mapping already used in `apps/www`.
- `apps/vite-app/tsconfig.node.json`
  - Type-checks `vite.config.ts` and `eslint.config.ts` with Node types.
- `apps/vite-app/vite.config.ts`
  - Enables React + Tailwind Vite plugins and resolves `~` plus the minimal `@acme/ui` compatibility alias already used elsewhere in the repo.
- `apps/vite-app/src/main.tsx`
  - Bootstraps React only.
- `apps/vite-app/src/app/app.tsx`
  - Renders the minimal static starter shell and one shared `Button`.
- `apps/vite-app/src/styles/globals.css`
  - Imports the shared `@acme/ui` stylesheet and Tailwind source reference.

### Files to modify
- `pnpm-lock.yaml`
  - Captures the new workspace importer entry and any dependency graph changes after `pnpm install`.

### Files to inspect while implementing
- `docs/superpowers/specs/2026-03-30-vite-app-template-design.md`
  - Approved scope and constraints.
- `package.json`
  - Root workspace script conventions.
- `pnpm-workspace.yaml`
  - Confirms `apps/*` already includes `apps/vite-app`.
- `turbo.json`
  - Confirms the new app should plug into existing `dev`, `build`, `lint`, and `typecheck` tasks.
- `apps/www/package.json`
  - Source of package-local script and Prettier conventions.
- `apps/www/tsconfig.json`
  - Confirms the existing workspace compatibility mapping for `@acme/ui/*` public-style imports.
- `apps/www/src/styles/globals.css`
  - Source of the current shared `@acme/ui` CSS import pattern.
- `apps/www/eslint.config.ts`
  - Reference for app-local ESLint configuration style.
- `apps/manager/package.json`
  - Source of Vite package dependency/version conventions already present in the repo.
- `apps/manager/src/vite.config.ts`
  - Source of the current `@acme/ui` Vite alias pattern.
- `@acme/ui/package.json`
  - Confirms the package does not currently publish root-level `@acme/ui/components/*` exports, which is why the plan documents a minimal compatibility bridge instead of inventing new alias families.
- `@acme/tsconfig/base.json`
  - Shared TS base options the new app should extend.
- `@acme/eslint-config/base.ts`
  - Shared base lint rules.
- `@acme/eslint-config/react.ts`
  - Shared React lint rules.
- `@acme/ui/src/components/button/index.tsx`
  - Confirms the public-style `@acme/ui/components/button` import path.

### Existing files that must remain unchanged
- `pnpm-workspace.yaml`
- `turbo.json`
- `package.json`
- `@acme/ui/**`

Compatibility note:
- The approved spec keeps app code on public-style imports such as `@acme/ui/components/button` and avoids broad new internal alias families.
- The current workspace package layout does not expose those subpaths directly from the `@acme/ui` package root, so this plan reuses the same minimal compatibility bridge that already exists in `apps/www/tsconfig.json` and `apps/manager/src/vite.config.ts`: `@acme/ui/* -> ../../@acme/ui/src/*` in TypeScript and `@acme/ui -> ../../@acme/ui/src` in Vite.
- Do not add any other `@acme/*` alias families beyond that documented bridge.

Do not broaden this work into shared-package exports, router setup, state management, or app generators.

---

### Task 1: Register the new workspace package

**Files:**
- Create: `apps/vite-app/package.json`
- Modify: `pnpm-lock.yaml`
- Inspect: `docs/superpowers/specs/2026-03-30-vite-app-template-design.md`
- Inspect: `package.json`
- Inspect: `apps/www/package.json`
- Inspect: `apps/manager/package.json`

- [ ] **Step 1: Re-read the approved spec and package conventions**

Read:
- `docs/superpowers/specs/2026-03-30-vite-app-template-design.md`
- `package.json`
- `apps/www/package.json`
- `apps/manager/package.json`

Expected reminders:
- package name must be `vite-app`
- the starter stays static and provider-free
- scripts should look like the other workspace packages
- use `pnpm`, not `npm`, `yarn`, or `bun`

- [ ] **Step 2: Run the red check before the package exists**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app build
```

Expected before creating the package:
- FAIL
- PNPM reports that no projects matched the `vite-app` filter

- [ ] **Step 3: Create `apps/vite-app/package.json`**

Write exactly this file:

```json
{
  "$schema": "https://json.schemastore.org/package.json",
  "name": "vite-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -b && vite build",
    "dev": "vite",
    "format": "prettier --check . --ignore-path ../../.gitignore",
    "lint": "eslint --flag unstable_native_nodejs_ts_config",
    "preview": "vite preview",
    "typecheck": "tsc -b"
  },
  "prettier": "@acme/prettier-config",
  "dependencies": {
    "@acme/ui": "workspace:*",
    "react": "catalog:react19",
    "react-dom": "catalog:react19"
  },
  "devDependencies": {
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/tsconfig": "workspace:*",
    "@tailwindcss/vite": "catalog:",
    "@types/node": "catalog:",
    "@types/react": "catalog:react19",
    "@types/react-dom": "catalog:react19",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "tailwindcss": "catalog:",
    "typescript": "catalog:",
    "vite": "catalog:"
  }
}
```

Notes:
- keep the package name exactly `vite-app`
- keep the script names exactly `dev`, `build`, `preview`, `lint`, `format`, `typecheck`
- keep `@vitejs/plugin-react` on the same explicit version currently used in `apps/manager/package.json` (`^6.0.1`) because it is not currently provided via the workspace catalog
- do not add router, test, or state dependencies

- [ ] **Step 4: Run workspace install to register the new importer**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" install
```

Expected:
- PASS
- install completes without errors
- `pnpm-lock.yaml` gains an importer entry for `apps/vite-app`

- [ ] **Step 5: Re-run the build as the next red check**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app build
```

Expected after only creating `package.json`:
- FAIL
- TypeScript or Vite reports missing config/source files such as `tsconfig.json` or the app entry files

- [ ] **Step 6: Optional commit checkpoint for package registration**

If the user asked for commit checkpoints, commit only these files:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add apps/vite-app/package.json pnpm-lock.yaml
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "chore: add vite-app package manifest"
```

If unrelated files are already staged, stage only `apps/vite-app/package.json` and `pnpm-lock.yaml` before committing. If the user did not ask for commits, skip this step.

---

### Task 2: Add Vite, TypeScript, and ESLint scaffolding

**Files:**
- Create: `apps/vite-app/eslint.config.ts`
- Create: `apps/vite-app/index.html`
- Create: `apps/vite-app/tsconfig.json`
- Create: `apps/vite-app/tsconfig.app.json`
- Create: `apps/vite-app/tsconfig.node.json`
- Create: `apps/vite-app/vite.config.ts`
- Inspect: `apps/www/eslint.config.ts`
- Inspect: `apps/manager/src/vite.config.ts`
- Inspect: `@acme/tsconfig/base.json`
- Inspect: `@acme/eslint-config/base.ts`
- Inspect: `@acme/eslint-config/react.ts`

- [ ] **Step 1: Re-read the existing config references before writing new ones**

Read:
- `apps/www/eslint.config.ts`
- `apps/manager/src/vite.config.ts`
- `@acme/tsconfig/base.json`
- `@acme/eslint-config/base.ts`
- `@acme/eslint-config/react.ts`

Expected findings:
- app-local ESLint configs use `defineConfig(...)`
- `baseConfig` and `reactConfig` are enough for a plain Vite React app
- the current repo already uses a minimal compatibility bridge for `@acme/ui` imports (`apps/www/tsconfig.json` and `apps/manager/src/vite.config.ts`)
- `@acme/tsconfig/base.json` already provides strict, bundler-oriented defaults that must be extended rather than copied

- [ ] **Step 2: Create the TypeScript config files**

Write `apps/vite-app/tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Write `apps/vite-app/tsconfig.app.json`:

```json
{
  "extends": "../../@acme/tsconfig/base.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./.cache/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"],
      "@acme/ui/*": ["../../@acme/ui/src/*"]
    }
  },
  "include": ["src"]
}
```

Why this deviation is allowed:
- Keep app source imports on public-style paths like `@acme/ui/components/button`.
- Because `@acme/ui/package.json` does not currently publish those subpaths from the package root, reuse the same compatibility mapping already present in `apps/www/tsconfig.json` instead of inventing new alias families or changing `@acme/ui`.

Write `apps/vite-app/tsconfig.node.json`:

```json
{
  "extends": "../../@acme/tsconfig/base.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./.cache/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"]
  },
  "include": ["vite.config.ts", "eslint.config.ts"]
}
```

Notes:
- keep `~/*` exactly as the approved alias
- keep `@acme/ui/*` only as the documented minimal compatibility path needed for current public-style subpath imports
- do not add any other alias families

- [ ] **Step 3: Create `vite.config.ts`, `eslint.config.ts`, and `index.html`**

Write `apps/vite-app/vite.config.ts`:

```ts
import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@acme/ui": path.resolve(__dirname, "../../@acme/ui/src"),
      "~": path.resolve(__dirname, "./src")
    }
  }
});
```

Why this alias is allowed:
- App code should still import shared UI through public-style paths like `@acme/ui/components/button`.
- The alias exists only to make those existing public-style subpath imports resolve in this Vite app, matching the compatibility bridge already used in `apps/manager/src/vite.config.ts`.
- Do not add extra aliases for `@acme/ui/components`, `@acme/ui/lib`, or other internal subtrees.

Write `apps/vite-app/eslint.config.ts`:

```ts
import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";
import { reactConfig } from "@acme/eslint-config/react";

export default defineConfig([{ ignores: ["dist/**"] }, ...baseConfig, ...reactConfig]);
```

Write `apps/vite-app/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App Template</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Notes:
- keep the Vite config intentionally small
- do not add router plugins, dev-server customization, or provider setup here

- [ ] **Step 4: Run the build again to confirm the next red failure**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app build
```

Expected after config scaffolding but before source files:
- FAIL
- Vite reports that `/src/main.tsx` or another app entry file is missing

- [ ] **Step 5: Optional commit checkpoint for config scaffolding**

If the user asked for commit checkpoints, commit only these files:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add apps/vite-app/eslint.config.ts apps/vite-app/index.html apps/vite-app/tsconfig.json apps/vite-app/tsconfig.app.json apps/vite-app/tsconfig.node.json apps/vite-app/vite.config.ts
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "chore: scaffold vite-app tooling"
```

If unrelated files are staged, stage only the six new config files before committing. If the user did not ask for commits, skip this step.

---

### Task 3: Add the starter shell and shared styles

**Files:**
- Create: `apps/vite-app/src/main.tsx`
- Create: `apps/vite-app/src/app/app.tsx`
- Create: `apps/vite-app/src/styles/globals.css`
- Inspect: `apps/www/src/styles/globals.css`
- Inspect: `@acme/ui/src/components/button/index.tsx`

- [ ] **Step 1: Re-read the shared CSS and button references**

Read:
- `apps/www/src/styles/globals.css`
- `@acme/ui/src/components/button/index.tsx`

Expected findings:
- the current workspace imports shared UI CSS with `@import "@acme/ui/src/styles/globals.css";`
- the workspace also uses `@source` to include `@acme/ui` Tailwind classes
- `Button` is consumed through `@acme/ui/components/button`

- [ ] **Step 2: Create `src/styles/globals.css`**

Write `apps/vite-app/src/styles/globals.css`:

```css
@import "@acme/ui/src/styles/globals.css";

@source "../../../../@acme/ui";
```

Notes:
- do not invent a new public CSS contract for `@acme/ui`
- do not add extra CSS unless it becomes strictly necessary for the starter shell

- [ ] **Step 3: Create `src/main.tsx`**

Write `apps/vite-app/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "~/styles/globals.css";
import { App } from "~/app/app";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Notes:
- keep bootstrap logic only in this file
- do not add providers here in the first pass

- [ ] **Step 4: Create `src/app/app.tsx`**

Write `apps/vite-app/src/app/app.tsx`:

```tsx
import { Button } from "@acme/ui/components/button";

export const App = () => {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">vyductan-react / apps/vite-app</p>
          <h1 className="text-4xl font-semibold tracking-tight">Vite App Template</h1>
          <p className="text-muted-foreground max-w-2xl text-base">
            React, TypeScript, Tailwind v4, and shared @acme/ui components are wired up so
            you can start building immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button>Shared UI button</Button>
        </div>
      </section>
    </main>
  );
};
```

Notes:
- keep the filename lowercase: `app.tsx`
- keep the shell static and generic
- use a simple `Button` only; do not add `ThemeProvider` or `ConfigProvider`

- [ ] **Step 5: Run the build and typecheck to turn the app green**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app build
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app typecheck
```

Expected after adding the source files:
- PASS
- Vite builds `apps/vite-app/dist`
- TypeScript completes without reporting unresolved `~/*` or `@acme/ui/*` imports

- [ ] **Step 6: Optional commit checkpoint for the starter shell**

If the user asked for commit checkpoints, commit only these files:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add apps/vite-app/src/main.tsx apps/vite-app/src/app/app.tsx apps/vite-app/src/styles/globals.css
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "feat: add vite-app starter shell"
```

If unrelated files are staged, stage only the three new source files before committing. If the user did not ask for commits, skip this step.

---

### Task 4: Run final tooling verification and prepare handoff

**Files:**
- Inspect: `apps/vite-app/package.json`
- Inspect: `apps/vite-app/eslint.config.ts`
- Inspect: `apps/vite-app/vite.config.ts`
- Inspect: `apps/vite-app/tsconfig.app.json`
- Inspect: `apps/vite-app/src/main.tsx`
- Inspect: `apps/vite-app/src/app/app.tsx`
- Inspect: `apps/vite-app/src/styles/globals.css`

- [ ] **Step 1: Run lint and format checks**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app lint
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app format
```

Expected:
- PASS
- ESLint reports no errors for the new app
- Prettier reports no formatting violations

If either command fails, make only the smallest fix inside `apps/vite-app/**`, then re-run the failed command before moving on.

- [ ] **Step 2: Run one final build + typecheck verification**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app build
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app typecheck
```

Expected:
- PASS
- no unresolved alias, Tailwind, or shared UI import errors remain

- [ ] **Step 3: Smoke the dev server manually**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" --filter vite-app dev -- --host 127.0.0.1
```

Expected:
- PASS
- Vite prints a `Local:` URL for the new app and stays running until interrupted
- opening the URL shows the static starter shell and a rendered shared `Button`

After confirming the page loads, stop the dev server with `Ctrl+C`.

- [ ] **Step 4: Optional final commit if verification required source changes**

If Step 1 or Step 2 required file edits **and** the user asked for commits, commit only the edited source/config files under `apps/vite-app` and do not stage generated output such as `dist/`:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add apps/vite-app/package.json apps/vite-app/eslint.config.ts apps/vite-app/index.html apps/vite-app/tsconfig.json apps/vite-app/tsconfig.app.json apps/vite-app/tsconfig.node.json apps/vite-app/vite.config.ts apps/vite-app/src/main.tsx apps/vite-app/src/app/app.tsx apps/vite-app/src/styles/globals.css
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "chore: finalize vite-app tooling"
```

If verification did not change any files, or the user did not ask for commits:
- do **not** create an empty commit
- confirm `git -C "/Users/vyductan/Developer/vyductan/vyductan-react" status --short` is clean or only shows unrelated user-owned work

- [ ] **Step 5: Prepare the implementation summary with evidence**

Summarize:
- created files under `apps/vite-app`
- the exact alias setup used: `~/* -> ./src/*` plus the documented minimal compatibility bridge for `@acme/ui/*` / `@acme/ui`
- the exact shared CSS import pattern used in `src/styles/globals.css`
- the exact commands that passed: `lint`, `format`, `build`, `typecheck`, and `dev`
- that the implementation stayed within scope: no router, no state library, no test runner, no provider setup

- [ ] **Step 6: Stop after verified delivery**

Do not:
- add routing
- add Zustand, TanStack Query, or any other app framework layer
- add Vitest or Testing Library
- refactor `@acme/ui`
- modify `pnpm-workspace.yaml`, `turbo.json`, or root package scripts unless a truly blocking issue appears
- create commits unless the user explicitly asked for them
