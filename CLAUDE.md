# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace

- Monorepo managed with TurboRepo and PNPM workspaces.
- Always use `pnpm` and `pnpm dlx` in this workspace.
- Ignore the backup snapshot under `@acme.backup-20260311-095727` unless the user explicitly asks to work there.

## Common commands

### Root workspace

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format
pnpm format:fix
pnpm clean:workspaces
```

### Targeted Turbo runs

```bash
pnpm dev:nextjs
pnpm lint:nextjs
pnpm build:nextjs
pnpm -F www build
pnpm -F @acme/ui test
```

## Package commands

### `apps/www` — main Next.js app

Run from the repo root:

```bash
pnpm -F www dev
pnpm -F www build
pnpm -F www lint
pnpm -F www typecheck
pnpm -F www db:push
pnpm -F www db:status
pnpm -F www db:seed:habits
pnpm -F www auth:generate
```

Notes:
- `apps/www` uses `pnpm with-env ...` scripts to load `../../.env` before running Next.js, Drizzle, or local scripts.
- The app dev server runs on port `4000`.

### `apps/manager` — Vite + Tauri app

```bash
pnpm -F acme-manager dev
pnpm -F acme-manager build
pnpm -F acme-manager preview
pnpm -F acme-manager tauri
```

### `@acme/ui` — shared component library

```bash
pnpm -F @acme/ui storybook
pnpm -F @acme/ui storybook:build
pnpm -F @acme/ui test
pnpm -F @acme/ui lint
pnpm -F @acme/ui typecheck
pnpm -F @acme/ui registry:build
pnpm -F @acme/ui ui-add
```

Single test example:

```bash
pnpm -F @acme/ui test -- --runInBand
```

## Architecture

### High level

- `apps/www` is the primary web app, built with Next.js App Router.
- `apps/manager` is a separate desktop-oriented React app built with Vite and Tauri.
- `@acme/ui` is the shared UI package used across apps; it contains reusable components, theming, Storybook docs, and Storybook/Vitest-based tests.
- `@acme/eslint-config`, `@acme/prettier-config`, and `@acme/tsconfig` provide shared tooling config across the workspace.

### `apps/www`

- The app entry layout is `apps/www/src/app/layout.tsx`.
- Global provider composition lives in `apps/www/src/app/providers.tsx`.
- Runtime env validation lives in `apps/www/src/env.ts` using `@t3-oss/env-nextjs`.
- The app consumes shared UI from `@acme/ui` and also has local app-specific UI under `apps/www/src/components`.
- Example/demo routes live under `apps/www/src/app/examples/*`.

### `@acme/ui`

- This package is both a reusable component library and the main UI experimentation surface.
- Storybook stories are colocated with components under `src/components`.
- Storybook is the primary way to inspect and develop components locally.
- Tests run through Vitest with the Storybook project configuration, so UI changes are usually validated from `@acme/ui` rather than from an app.
- The package exposes shadcn/Tailwind-based components with APIs influenced by Ant Design patterns.

## Environment and tooling notes

- Root Turbo tasks declare shared env vars in `turbo.json`; check that file when a command behaves differently in CI or Vercel.
- `pnpm install` triggers `pnpm lint:ws`, which runs `pnpm dlx sherif@latest` as a workspace consistency check.
- Root `lint` and `typecheck` commands run through Turbo and may depend on upstream package builds.
- `apps/www` metadata uses `PORT`/`VERCEL_ENV` from validated envs when constructing its runtime base URL.

## Files worth reading first

- `AGENTS.md` — repo-wide navigation and operating notes
- `package.json` — root Turbo commands
- `turbo.json` — task graph and shared env configuration
- `pnpm-workspace.yaml` — workspace package layout
- `apps/www/package.json` — app-specific scripts
- `@acme/ui/package.json` — component library, Storybook, and test scripts
