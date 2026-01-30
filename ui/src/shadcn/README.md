# Shadcn Components

This directory contains shadcn/ui components that have been installed and customized for this project.

## Installing New Components

### Using the npm script (Recommended)

From the project root:

```bash
cd @acme/ui
pnpm ui-add
```

This script will:
- Run `shadcn@latest add` to add components
- Automatically format code with Prettier

### Using CLI directly

```bash
cd @acme/ui
pnpm dlx shadcn@latest add [component-name]
```

**Examples:**

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card dialog
```

## Updating Existing Components

Shadcn/ui doesn't have a built-in update mechanism. To update components:

### Option 1: Overwrite (Loses customizations)

```bash
cd @acme/ui
pnpm dlx shadcn@latest add [component-name] --overwrite
```

⚠️ **Warning:** This will completely overwrite the current file. All customizations will be lost.

### Option 2: Manual Diff (Recommended)

1. Generate a diff to see what changed:
```bash
cd @acme/ui
pnpm dlx shadcn@latest diff [component-name]
```

2. Review changes and manually merge into the current file

3. Or view the latest code on GitHub:
   - Go to https://ui.shadcn.com/docs/components/[component-name]
   - Click "View code" to see the latest source
   - Compare with your local file

## Configuration

Shadcn configuration file: [`components.json`](../components.json)

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "aliases": {
    "ui": "@acme/ui/shadcn"
  }
}
```

## Architecture

This project uses a **two-layer component architecture**:

```
@acme/ui/src/
├── shadcn/          # Base shadcn components (this directory)
│   ├── button.tsx   # Raw shadcn component
│   ├── badge.tsx
│   └── ...
└── components/      # Customized wrapper components
    ├── button/
    │   └── index.tsx  # Wraps @acme/ui/shadcn/button
    ├── badge/
    │   └── index.tsx  # Wraps @acme/ui/shadcn/badge
    └── ...
```

### Why this architecture?

- **`/shadcn/`** contains pristine shadcn components that can be updated via CLI
- **`/components/`** contains your custom wrappers that add functionality
- Updates to shadcn components **don't break** your customizations

### Example Wrapper Pattern

```tsx
// @acme/ui/components/button/index.tsx
import { Button as ShadcnButton } from "@acme/ui/shadcn/button"

// Add custom props and logic
const Button = ({ customProp, ...props }) => {
  return <ShadcnButton {...props} />
}
```

## Importing Components

**In application code, always import from `/components/`, NOT from `/shadcn/`:**

```tsx
// ✅ Correct - uses your customized wrapper
import { Button } from "@acme/ui/components/button"

// ❌ Wrong - bypasses customizations
import { Button } from "@acme/ui/shadcn/button"
```

## Customization Workflow

### ⚠️ DO NOT customize files in `/shadcn/` directly

This directory should remain pristine to allow easy updates via CLI.

### ✅ Add customizations in `/components/`

1. Create a wrapper component in `/components/[component-name]/`
2. Import the base shadcn component
3. Add your custom logic, variants, or props
4. Export the enhanced component

**Example:**

```tsx
// components/button/index.tsx
import { Button as ShadcnButton } from "@acme/ui/shadcn/button"

export const Button = ({ loading, ...props }) => {
  return (
    <ShadcnButton disabled={loading} {...props}>
      {loading ? <Spinner /> : props.children}
    </ShadcnButton>
  )
}
```

### When shadcn components are updated

Since `/shadcn/` files are kept pristine, you can safely update them without breaking your customizations in `/components/`

## Current Components

See [`index.ts`](./index.ts) for all installed components.

Or list them quickly:

```bash
ls @acme/ui/src/shadcn/*.tsx
```

## Troubleshooting

### Component can't be imported

Check:
1. Is the component exported in `index.ts`?
2. Is the path alias in `components.json` correct?
3. Does your TypeScript config resolve the path?

### Conflicts with old version

```bash
# Remove node_modules and reinstall
pnpm clean
pnpm install
```

### Missing dependencies error

Shadcn will auto-install Radix UI dependencies. If missing:

```bash
pnpm install @radix-ui/react-[component-name]
```

## Resources

- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com)
