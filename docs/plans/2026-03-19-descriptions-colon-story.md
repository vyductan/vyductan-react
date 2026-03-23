# Descriptions colon verification story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a small Storybook story that visually verifies Descriptions colon behavior: horizontal non-bordered shows colons, vertical non-bordered does not.

**Architecture:** Extend `@acme/ui/src/components/descriptions/descriptions.stories.tsx` with one additional comparison story that reuses the existing dataset and title. Render a horizontal non-bordered example and a vertical non-bordered example side by side so the colon rule can be checked visually without changing component logic or adding controls.

**Tech Stack:** React 19, TypeScript, Storybook 10 (`@storybook/nextjs-vite`), Tailwind utility classes, PNPM workspace, `@acme/ui`

---

### Task 1: Create a minimal colon verification story

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx:58-84`

**Step 1: Keep existing story data and exports intact**

Do not remove or redesign `CompareSizes`. Reuse the existing `descriptionItems` array and `descriptionsTitle` constant.

**Step 2: Add a small helper for colon behavior sections if it improves readability**

Either add a new helper like:

```tsx
function renderColonSection(
  title: string,
  layout: "horizontal" | "vertical",
): ReactElement {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <Descriptions title={descriptionsTitle} layout={layout} items={descriptionItems} />
    </section>
  );
}
```

or inline the JSX directly in the story if that is simpler. Do not add abstractions beyond this small story-local helper.

**Step 3: Add `CompareColonBehavior`**

Add a new story that renders two non-bordered examples side by side:

```tsx
export const CompareColonBehavior: Story = {
  render: () => (
    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
      <section className="space-y-3">
        <h3 className="text-sm font-medium">Horizontal / bordered=false</h3>
        <Descriptions title={descriptionsTitle} layout="horizontal" items={descriptionItems} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Vertical / bordered=false</h3>
        <Descriptions title={descriptionsTitle} layout="vertical" items={descriptionItems} />
      </section>
    </div>
  ),
};
```

Notes:
- Do not set `bordered`; default `false` is the behavior being verified.
- Reuse the same data so the visual difference comes from layout and colon behavior only.
- Keep the story focused; no `colon={false}` override demo in this task.

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "docs: add descriptions colon comparison story"
```

### Task 2: Verify the new story compiles and stays within scope

**Files:**
- Verify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`
- Reference: `@acme/ui/package.json:8-22`

**Step 1: Run typecheck**

```bash
pnpm -F @acme/ui typecheck
```

Expected:
- PASS
- no TypeScript errors in the story file

**Step 2: Lint the Descriptions files directly**

```bash
pnpm -F @acme/ui exec eslint --flag unstable_native_nodejs_ts_config "src/components/descriptions/descriptions.tsx" "src/components/descriptions/descriptions.stories.tsx"
```

Expected:
- PASS with no lint errors for those files

**Step 3: Verify in Storybook**

Run Storybook if needed:

```bash
pnpm -F @acme/ui storybook
```

Open `Components/Descriptions/CompareColonBehavior` and confirm:
- horizontal non-bordered labels display colons
- vertical non-bordered labels do not display colons
- `CompareSizes` remains intact

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: verify descriptions colon behavior story"
```
