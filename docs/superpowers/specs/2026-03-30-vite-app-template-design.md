# Vite app template design

## Goal

Add a new internal Vite application template at [apps/vite-app](../../apps/vite-app) for the `vyductan-react` monorepo.

The template should give the workspace a lightweight React + TypeScript starter that is wired into the existing monorepo conventions, reuses `@acme/ui`, and stays intentionally small enough to serve as a reusable base for future apps.

## Scope

This design covers only the first-pass template app.

Included:

- Vite + React + TypeScript application scaffold
- workspace package setup under `apps/vite-app`
- shared config integration with `@acme/eslint-config`, `@acme/prettier-config`, and `@acme/tsconfig`
- shared UI integration with `@acme/ui`
- path alias setup for `~/* -> ./src/*`
- Tailwind v4 wiring required to consume shared `@acme/ui` styles
- a minimal app shell that proves the wiring works
- scripts that fit the existing Turborepo workspace flow

Excluded:

- routing
- test runner setup
- state management setup
- data fetching abstractions
- environment-variable tooling
- product-specific features
- extra generators or scaffolding automation

## References consulted

- [refs/ui/templates/vite-monorepo/apps/web/package.json](../../../refs/ui/templates/vite-monorepo/apps/web/package.json)
- [refs/ui/templates/vite-monorepo/apps/web/tsconfig.json](../../../refs/ui/templates/vite-monorepo/apps/web/tsconfig.json)
- [refs/ui/templates/vite-monorepo/apps/web/vite.config.ts](../../../refs/ui/templates/vite-monorepo/apps/web/vite.config.ts)
- [apps/manager/package.json](../../apps/manager/package.json)
- [apps/manager/src/vite.config.ts](../../apps/manager/src/vite.config.ts)
- [apps/www/src/styles/globals.css](../../apps/www/src/styles/globals.css)
- [@acme/ui/package.json](../../@acme/ui/package.json)
- [@acme/ui/src/styles/globals.css](../../@acme/ui/src/styles/globals.css)
- [package.json](../../package.json)
- [pnpm-workspace.yaml](../../pnpm-workspace.yaml)
- [turbo.json](../../turbo.json)

## Current workspace context

- The workspace already contains a primary Next.js app at [apps/www](../../apps/www).
- The workspace catalog already includes `vite`, `@tailwindcss/vite`, `tailwindcss`, `react`, `react-dom`, and TypeScript in [pnpm-workspace.yaml](../../pnpm-workspace.yaml), and existing apps already use `@vitejs/plugin-react` with a repo-established explicit version.
- A Vite-based app already exists in the repo at [apps/manager/package.json](../../apps/manager/package.json), but it is Tauri-oriented and not suitable as a clean reusable web template.
- `@acme/ui` is a Tailwind-based shared UI package, and [apps/www/src/styles/globals.css](../../apps/www/src/styles/globals.css) already proves the current workspace pattern for consuming its shared CSS.
- Turborepo tasks are already standardized at the workspace root in [turbo.json](../../turbo.json), so the new app should plug into the existing `dev`, `build`, `lint`, and `typecheck` flows instead of inventing parallel commands.

## Decision

Create a new app at [apps/vite-app](../../apps/vite-app) as a monorepo-native Vite React template.

Key decisions:

1. Use React + TypeScript with Vite.
2. Keep the app small and starter-oriented rather than product-oriented.
3. Use shared workspace configs where practical:
   - `@acme/eslint-config`
   - `@acme/prettier-config`
   - `@acme/tsconfig`
4. Wire the app to `@acme/ui` from day one so the template proves shared UI consumption.
5. Use the user-requested alias `~/*` for `src/*`.
6. Use [src/app/app.tsx](../../apps/vite-app/src/app/app.tsx) as the root app component file, intentionally lowercase.
7. Choose Tailwind v4 explicitly for the starter because shared `@acme/ui` styles already depend on it.
8. Do not add routing, state management, tests, or feature-specific abstractions in the initial scaffold.

## Package identity

[apps/vite-app/package.json](../../apps/vite-app/package.json) should use:

- `"name": "vite-app"`
- `"private": true`
- `"type": "module"`

This keeps the package identity aligned with the folder name and matches the intended workspace commands:

- `pnpm --filter vite-app dev`
- `pnpm --filter vite-app build`
- `pnpm --filter vite-app typecheck`
- `pnpm --filter vite-app lint`

## Proposed file structure

```text
apps/vite-app/
  eslint.config.ts
  index.html
  package.json
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.ts
  src/
    main.tsx
    app/
      app.tsx
    styles/
      globals.css
```

Notes:

- The structure is intentionally shallow so future apps can copy it without cleanup.
- `src/app/app.tsx` is the main UI entrypoint; `src/main.tsx` stays responsible only for bootstrapping React.
- No placeholder `src/components/` or `src/lib/` directories are created in the first pass because the starter does not need them yet.

## Package and script design

[apps/vite-app/package.json](../../apps/vite-app/package.json) should align with the workspace patterns used by [package.json](../../package.json) and [apps/www/package.json](../../apps/www/package.json), while remaining Vite-native.

Proposed scripts:

- `dev`: run the Vite dev server
- `build`: run TypeScript project build/checking and then `vite build`
- `preview`: run `vite preview`
- `lint`: run ESLint using the shared workspace config
- `typecheck`: run TypeScript without producing distributable output
- `format`: run Prettier using the workspace ignore rules if that matches the current package conventions

Dependencies should be limited to what the starter truly needs.

Runtime:

- `@acme/ui`
- `react`
- `react-dom`

Development:

- `@acme/eslint-config`
- `@acme/prettier-config`
- `@acme/tsconfig`
- `@vitejs/plugin-react` using the same explicit repo version already used by the existing Vite app
- `@tailwindcss/vite`
- `tailwindcss`
- `vite`
- `typescript`
- relevant React and Node type packages
- `eslint`
- `prettier`

The app should prefer workspace catalog versions where the monorepo already defines them, and follow the repo's established explicit version convention for dependencies like `@vitejs/plugin-react` that are not currently cataloged.

## TypeScript and alias design

The app should use a split tsconfig layout consistent with modern Vite templates:

- `tsconfig.json` as the project reference root
- `tsconfig.app.json` for browser/app compilation
- `tsconfig.node.json` for Vite config typing

Alias decisions:

- `~/*` resolves to `./src/*`
- app source should use public-style shared UI imports already used elsewhere in the workspace, for example:
  - `@acme/ui/components/button`
  - `@acme/ui/components/theme`
- because the current `@acme/ui` package layout does not publish those subpaths directly from the package root, the starter may reuse the same minimal monorepo-only compatibility bridge that already exists elsewhere in the repo:
  - TypeScript: `@acme/ui/*` -> `../../@acme/ui/src/*`
  - Vite: `@acme/ui` -> `../../@acme/ui/src`
- do not add any broader alias families into `@acme/ui` internals beyond that compatibility bridge

This keeps the starter aligned with existing app usage while documenting the current monorepo constraint explicitly instead of inventing a new public export surface for `@acme/ui`. Future cleanup can remove the bridge once `@acme/ui` publishes those subpaths directly.

## Vite config design

[vite.config.ts](../../apps/vite-app/vite.config.ts) should stay intentionally small.

Responsibilities:

- enable the React plugin
- enable the Tailwind Vite plugin
- define alias resolution for `~` to `src`
- if needed for the documented `@acme/ui` compatibility bridge, add only the minimal `@acme/ui` alias used to make existing public-style subpath imports resolve
- avoid custom build complexity unless required by monorepo integration

The design should follow the simplicity of [refs/ui/templates/vite-monorepo/apps/web/vite.config.ts](../../../refs/ui/templates/vite-monorepo/apps/web/vite.config.ts) rather than the more special-purpose Tauri setup in [apps/manager/src/vite.config.ts](../../apps/manager/src/vite.config.ts).

## Styling design

The starter should include a single global stylesheet at [src/styles/globals.css](../../apps/vite-app/src/styles/globals.css).

This file should explicitly follow the existing shared-style consumption pattern:

```css
@import "@acme/ui/src/styles/globals.css";

@source "../../../../@acme/ui";
```

This is an intentional monorepo-internal coupling to the current `@acme/ui` source layout, not a stable public API. The template accepts this constraint because the workspace already uses the same pattern in [apps/www/src/styles/globals.css](../../apps/www/src/styles/globals.css) and there is not yet a public exported stylesheet contract for `@acme/ui`.

App-specific CSS in this file should stay minimal and should only cover the starter shell itself.

Expectations:

- provide enough base styling so the initial shell looks intentional
- keep the CSS small and starter-focused
- avoid adding a large custom theme layer
- rely on Tailwind v4 and the shared `@acme/ui` stylesheet as the styling baseline

The goal is not to produce a finished design system surface. The goal is to make the template readable and usable immediately.

## UI shell design

The first screen should act as proof that the template is wired correctly, not as a product homepage.

The shell should include:

- a page wrapper with baseline spacing and typography
- a small heading that identifies the app as a Vite template/starter
- a short description of what is prewired in the template
- one simple shared UI example using [Button](../../@acme/ui/src/components/button/index.tsx) via `@acme/ui/components/button`

This surface should be intentionally static. It should not introduce routing, async loading, or demo-heavy behavior.

## Provider posture

The first-pass starter should avoid app-wide providers unless they are truly required for the initial shell.

Decisions:

- do not add `ThemeProvider` in the first pass
- do not add `ConfigProvider` in the first pass
- choose a simple shared UI component for the starter shell that renders correctly without extra provider setup

If a future app needs theme switching or global UI configuration, those can be added on top of the template later.

## Data flow

The template’s data flow is deliberately minimal:

1. `index.html` provides the `#root` mount target.
2. [src/main.tsx](../../apps/vite-app/src/main.tsx) mounts React and imports the global stylesheet.
3. [src/main.tsx](../../apps/vite-app/src/main.tsx) renders [src/app/app.tsx](../../apps/vite-app/src/app/app.tsx).
4. [src/app/app.tsx](../../apps/vite-app/src/app/app.tsx) renders the initial static shell and shared UI example.

No app state container, router, or external API boundary is introduced in this first pass.

## Error handling posture

Keep error handling minimal.

Rules:

- do not add a custom error boundary yet
- do not add fallback states for nonexistent async paths
- do not add environment validation that the template does not actually need
- rely on Vite, React, and TypeScript for the normal starter-level feedback loops

This keeps the template focused and avoids inventing complexity for scenarios that do not exist in the starter.

## Testing and verification posture

Do not add a test framework in this initial template.

Verification should instead prove that the scaffold integrates correctly with the workspace:

- the new package is discovered by PNPM/Turbo
- `pnpm --filter vite-app dev` starts the Vite app
- `pnpm --filter vite-app build` completes successfully
- `pnpm --filter vite-app typecheck` completes successfully
- `pnpm --filter vite-app lint` completes successfully if the package is wired to the shared lint setup

If formatting is configured for the package, `pnpm --filter vite-app format` should also work.

## Non-goals

This design intentionally does not include:

- React Router
- TanStack Query
- Zustand or other state libraries
- Vitest or Testing Library setup
- auth, API clients, or server communication
- storybook integration
- code generation or a workspace-level template command

Those can be layered on later if a concrete app needs them.

## Risks and constraints

- Shared lint or tsconfig packages may still require minor app-specific configuration because the workspace is currently centered on Next.js and shared package development.
- The shared `@acme/ui` styling pattern depends on Tailwind-aware CSS processing, so the Vite app must keep the Tailwind plugin and shared CSS import aligned.
- The workspace already contains a special-purpose Vite app under [apps/manager](../../apps/manager), so the new template should avoid inheriting Tauri-specific assumptions.
- The new template should remain obviously generic so it can serve as a clean copy point for future apps.

## Implementation notes

- Prefer the workspace catalog versions already defined in [pnpm-workspace.yaml](../../pnpm-workspace.yaml).
- Prefer the simplest Vite config that supports `~` aliasing, Tailwind v4, and shared UI consumption.
- Keep [src/main.tsx](../../apps/vite-app/src/main.tsx) focused on bootstrap only.
- Keep [src/app/app.tsx](../../apps/vite-app/src/app/app.tsx) focused on the starter shell only.
- Avoid introducing helpers or abstractions unless the scaffold truly needs them immediately.

## Summary

The cleanest solution is to add [apps/vite-app](../../apps/vite-app) as a lightweight, monorepo-native Vite React + TypeScript starter that:

- uses shared workspace config packages
- consumes `@acme/ui`
- uses `~/*` for `src/*`
- uses lowercase [src/app/app.tsx](../../apps/vite-app/src/app/app.tsx)
- uses Tailwind v4 explicitly so shared `@acme/ui` styles work
- avoids extra providers in the first pass
- provides a minimal static shell instead of a product-specific app surface

This gives the repo a reusable Vite template without overcommitting to routing, testing, or app architecture choices too early.
