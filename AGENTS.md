# Repository Overview

Monorepo for the Vyductan React project using TurboRepo, managing web and mobile applications with shared UI and API packages.

## Navigation

| Directory                                                                   | Description                           | When to read                                                              |
| :-------------------------------------------------------------------------- | :------------------------------------ | :------------------------------------------------------------------------ |
| [`apps/`](file:///Users/vyductan/Developer/vyductan-react/apps/AGENTS.md)   | Application source code (Web, Mobile) | Implementing features, fixing bugs in specific apps, managing deployments |
| [`@acme/`](file:///Users/vyductan/Developer/vyductan-react/@acme/AGENTS.md) | Shared packages (UI, API, Configs)    | Modifying shared components, updating API logic, changing global configs  |

| File                  | Description                | When to read                                                   |
| :-------------------- | :------------------------- | :------------------------------------------------------------- |
| `CHECKLIST.mdx`       | Project checklist          | Tracking detailed project status and todos                     |
| `package.json`        | Root package configuration | Managing workspace dependencies, scripts, and project metadata |
| `turbo.json`          | TurboRepo configuration    | Configuring build pipelines, caching, and task dependencies    |
| `pnpm-workspace.yaml` | PNPM workspace config      | Managing monorepo workspace structure                          |

## Operational

### Install Dependencies

```bash
pnpm install
```

### Build All

```bash
pnpm build
```

### Run Dev

```bash
pnpm dev
```
