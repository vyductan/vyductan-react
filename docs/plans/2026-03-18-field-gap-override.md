# Field Gap Override Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Override the custom `@acme/ui` Field component so it uses `gap-2` instead of the shadcn default `gap-3`, without editing anything under `@acme/ui/src/shadcn/`.

**Architecture:** Add a thin wrapper component in `@acme/ui/src/components/field/field.tsx` that reuses the shadcn `Field` and overrides only the root spacing class. Then update the custom field barrel export so consumers import the wrapped `Field` from `@acme/ui/src/components/field` while all other shadcn field exports remain unchanged.

**Tech Stack:** React, TypeScript, Tailwind CSS, class-variance-authority patterns already used by the field components, PNPM workspace commands.

---

### Task 1: Add the custom Field wrapper

**Files:**
- Create: `@acme/ui/src/components/field/field.tsx`
- Reference: `@acme/ui/src/shadcn/field.tsx:81-95`
- Reference: `@acme/ui/src/components/field/field-label.tsx:1-59`

**Step 1: Write the wrapper component**

Create a thin wrapper that:
- imports `Field as ShadField` from `@acme/ui/shadcn/field`
- imports `cn` from `@acme/ui/lib/utils`
- accepts `React.ComponentProps<typeof ShadField>`
- renders `<ShadField ... />`
- appends `className={cn("gap-2", className)}` so the custom component wins over the shadcn default `gap-3`
- does not reimplement orientation logic or duplicate shadcn variants

```tsx
import { cn } from "@acme/ui/lib/utils";
import { Field as ShadField } from "@acme/ui/shadcn/field";

type FieldProps = React.ComponentProps<typeof ShadField>;

const Field = ({ className, ...props }: FieldProps) => {
  return <ShadField className={cn("gap-2", className)} {...props} />;
};

export { Field };
```

**Step 2: Sanity-check the wrapper against existing patterns**

Verify it matches the local customization style already used by `FieldLabel`:
- no logic copied from `@acme/ui/src/shadcn/field.tsx`
- only local override behavior added
- no change to prop shape

Expected: The wrapper is a minimal customization layer in `components/field/`, not a fork of the shadcn source.

### Task 2: Export the custom Field instead of the shadcn Field

**Files:**
- Modify: `@acme/ui/src/components/field/index.ts:1-14`

**Step 1: Stop re-exporting `Field` from shadcn**

Update the existing grouped export so it no longer exports `Field` from `@acme/ui/shadcn/field`.

Expected end state:
- `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, and `FieldTitle` still come from shadcn
- `Field` comes from `./field`
- `FieldLabel` still comes from `./field-label`

**Step 2: Add the local export**

Add:

```ts
export * from "./field";
```

Keep:

```ts
export * from "./field-label";
```

Expected: Consumers importing from `@acme/ui/src/components/field` get the customized `Field` automatically.

### Task 3: Verify the override

**Files:**
- Verify: `@acme/ui/src/components/field/field.tsx`
- Verify: `@acme/ui/src/components/field/index.ts`

**Step 1: Run targeted typecheck for the UI package**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected: PASS

**Step 2: Optionally run targeted tests if the package already has lightweight coverage available**

Run:

```bash
pnpm -F @acme/ui test -- --runInBand
```

Expected: PASS if the local environment is already healthy. If unrelated pre-existing failures exist, record them and do not widen the code change.

**Step 3: Confirm the customization path**

Manually verify:
- no files under `@acme/ui/src/shadcn/` changed
- the only behavior change is the `Field` root gap override from `gap-3` to `gap-2`
- `FieldLabel` remains unchanged

Expected: The request is satisfied entirely inside `@acme/ui/src/components/field/`.

### Task 4: Commit the focused change

**Files:**
- Stage: `@acme/ui/src/components/field/field.tsx`
- Stage: `@acme/ui/src/components/field/index.ts`

**Step 1: Stage only the relevant files**

```bash
git add @acme/ui/src/components/field/field.tsx @acme/ui/src/components/field/index.ts
```

**Step 2: Create a focused commit**

```bash
git commit -m "refactor: override field gap in custom field component"
```

Expected: One small commit containing only the custom field override work.
