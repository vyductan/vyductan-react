# Updating shadcn/ui Components

This guide explains how to update existing shadcn/ui components in the `@acme/ui` package to their latest versions.

## ⚠️ CRITICAL WARNING: Hybrid Components

Before updating, it is extremely important to know that **many components in this project are highly customized** (Hybrid Shadcn UI + Ant Design API). Overwriting them with the original Shadcn code will wipe out these custom modifications.

The following components extend Shadcn with Ant Design props (`size="large"`, `status`, `loading`, `columns`, etc.):

- `avatar`, `button`, `card`, `date-picker`, `divider`, `input`, `modal`, `select`, `table`, `tag`, `time-picker`

**ALWAYS carefully review the `git diff` after an update and manually restore any custom Props, Ant Design integrations, or specific project logic that was overwritten.**

## Update Workflow

### 1. Ensure a Clean Git State

Make sure your working directory is clean and all changes are committed. This allows you to easily view the original code diff and revert if something goes wrong.

### 2. View Changes Before Updating (Recommended)

You can use the `diff` command to see what changes the latest shadcn version will apply to your local component before actually modifying the file.

```bash
# In the @acme/ui directory
pnpm dlx shadcn@latest diff [component-name]

# Example:
pnpm dlx shadcn@latest diff button
```

### 3. Update the Component

You can update a component by re-adding it with the `--overwrite` flag.

```bash
# Update a specific component
pnpm dlx shadcn@latest add [component-name] --overwrite

# Example:
pnpm dlx shadcn@latest add select --overwrite

# Update multiple components
pnpm dlx shadcn@latest add button input select --overwrite
```

Alternatively, you can use the interactive script defined in `package.json` and select components from the prompt:

```bash
pnpm run ui-add
```

### 4. Restore Custom Modifications

Check your `git diff` right after the update to see what custom code was removed. Restore any Ant Design API integrations, custom Tailwind variants, or specific additions mapped to our design system constraints.

### 5. Format and Validate

After the update and the merge of custom code is complete:

1. **Format:** Run `pnpm run format` to ensure styling consistency.
2. **Typecheck:** Run `pnpm run typecheck` to catch any typing or TypeScript issues.
3. **Storybook:** Run `pnpm run storybook:dev` to ensure the component renders correctly and any hybrid states (like `loading=true`) are still functioning exactly as intended.
