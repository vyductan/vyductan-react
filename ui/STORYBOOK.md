# Storybook Documentation

This package (`@acme/ui`) uses Storybook for component development and documentation.

## Getting Started

Run Storybook locally:

```bash
pnpm storybook
```

This will start the development server at http://localhost:6006.

## Writing Stories

Stories are co-located with components in the `src/components` directory. For example:

- Component: `src/components/button/button.tsx`
- Stories: `src/components/button/button.stories.tsx`

We use the [Component Story Format (CSF)](https://storybook.js.org/docs/api/csf) with TypeScript.

### Example Story

```tsx
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};
```

## Chromatic Integration

We use [Chromatic](https://www.chromatic.com/) for visual regression testing.

### Automated Workflow

Chromatic runs automatically on every push to `main` and on Pull Requests via GitHub Actions.

### Manual Run

You can run Chromatic manually if needed (requires `CHROMATIC_PROJECT_TOKEN`):

```bash
pnpm chromatic
```

## Vercel Deployment

Storybook is deployed to Vercel.

- **Build Command**: `pnpm storybook:build`
- **Output Directory**: `storybook-static`
- **Framework**: Vite

The deployment is configured in `vercel.json`.
