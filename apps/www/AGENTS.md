# Web Application

Next.js-based web application.

## Navigation

| Directory                                                                              | Description                | When to read                                |
| :------------------------------------------------------------------------------------- | :------------------------- | :------------------------------------------ |
| [`mdx/`](file:///Users/vyductan/Developer/vyductan-react/apps/www/mdx/AGENTS.md)       | MDX content and components | handling markdown content processing        |
| [`public/`](file:///Users/vyductan/Developer/vyductan-react/apps/www/public/AGENTS.md) | Static assets              | managing images, fonts, and static files    |
| [`src/`](file:///Users/vyductan/Developer/vyductan-react/apps/www/src/AGENTS.md)       | Source code                | implementing application features and logic |

| File                 | Description              | When to read                                   |
| :------------------- | :----------------------- | :--------------------------------------------- |
| `eslint.config.ts`   | ESLint configuration     | adjusting app-specific linting rules           |
| `next-env.d.ts`      | Next.js types            | referencing Next.js types                      |
| `next.config.js`     | Next.js configuration    | modifying build settings, env vars, or plugins |
| `package.json`       | Dependencies and scripts | managing app dependencies                      |
| `postcss.config.cjs` | PostCSS configuration    | processing CSS                                 |
| `tsconfig.json`      | TypeScript configuration | adjusting TypeScript options                   |
| `turbo.json`         | TurboRepo task config    | configuring build/lint tasks                   |

## Operational

### Run Dev Server

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```
