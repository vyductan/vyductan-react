# UI Component Library

Shared React component library using Tailwind CSS.

## Navigation

| Directory                                                                                                  | Description            | When to read                            |
| :--------------------------------------------------------------------------------------------------------- | :--------------------- | :-------------------------------------- |
| [`src/`](file:///Users/vyductan/Developer/vyductan-react/@acme/ui/src/AGENTS.md)                           | Component source code  | implementing or modifying UI components |
| [`storybook-static/`](file:///Users/vyductan/Developer/vyductan-react/@acme/ui/storybook-static/AGENTS.md) | Static storybook build | checking generated storybook files      |

| File                                                                                                                            | Description                     | When to read                          |
| :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------ | :------------------------------------ |
| `chromatic.config.json`                                                                                                         | Chromatic visual testing config | settings up visual regression tests   |
| `components.json`                                                                                                               | Shadcn/ui configuration         | managing component generator settings |
| `eslint.config.ts`                                                                                                              | ESLint configuration            | adjusting linting rules               |
| `package.json`                                                                                                                  | Package dependencies            | managing UI library dependencies      |
| `postcss.cjs`                                                                                                                   | PostCSS config                  | css processing settings               |
| [`STORYBOOK.md`](file:///Users/vyductan/Developer/vyductan-react/@acme/ui/STORYBOOK.md)                                         | Storybook documentation         | understanding storybook setup         |
| [`STORYBOOK_ENVIRONMENT_ISSUE.md`](file:///Users/vyductan/Developer/vyductan-react/@acme/ui/STORYBOOK_ENVIRONMENT_ISSUE.md)     | Known issues                    | troubleshooting environment problems  |
| [`STORYBOOK_INTERACTION_TESTING.md`](file:///Users/vyductan/Developer/vyductan-react/@acme/ui/STORYBOOK_INTERACTION_TESTING.md) | Interaction testing guide       | writing interactive component tests   |
| `tsconfig.json`                                                                                                                 | TypeScript config               | adjusting compiler options            |
| `types.d.ts`                                                                                                                    | Type definitions                | global type overrides                 |
| `vercel.json`                                                                                                                   | Vercel deployment config        | configuring deployment settings       |
| `vitest.config.ts`                                                                                                              | Vitest configuration            | setting up unit tests                 |
| `vitest.shims.d.ts`                                                                                                             | Vitest type shims               | extending test types                  |

## Operational

### Run Storybook

```bash
pnpm dev
```

### Build Library

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```
