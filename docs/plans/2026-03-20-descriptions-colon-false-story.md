# Descriptions colon=false comparison story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new Storybook section above the existing horizontal colon example so `CompareColonBehavior` shows `layout="horizontal"`, `bordered={false}`, and `colon={false}` for direct visual comparison.

**Architecture:** Keep the change story-local in `@acme/ui/src/components/descriptions/descriptions.stories.tsx`. Extend the existing `renderColonBehaviorVariant()` helper so it can render both the current examples and one additional `colon={false}` variant without duplicating JSX. Preserve the current vertical stack order while inserting the new horizontal no-colon example first.

**Tech Stack:** React 19, TypeScript, Storybook 10 (`@storybook/nextjs-vite`), Tailwind utility classes, PNPM workspace, `@acme/ui`

---

### Task 1: Add a horizontal colon=false section to CompareColonBehavior

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx:82-109`

**Step 1: Write the failing test by encoding the desired story structure in the story file**

Update the story helper signature so it can accept heading text and an optional `colon` prop, then add a new first section in `renderCompareColonBehavior()`.

Target structure:

```tsx
function renderColonBehaviorVariant({
  heading,
  layout,
  colon,
}: {
  heading: string;
  layout: "horizontal" | "vertical";
  colon?: boolean;
}): ReactElement {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">{heading}</h3>
      <Descriptions
        title={descriptionsTitle}
        layout={layout}
        colon={colon}
        items={descriptionItems}
      />
    </section>
  );
}
```

And render the sections in this order:

```tsx
function renderCompareColonBehavior(): ReactElement {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      {renderColonBehaviorVariant({
        heading: "Horizontal / bordered=false / colon=false",
        layout: "horizontal",
        colon: false,
      })}
      {renderColonBehaviorVariant({
        heading: "Horizontal / bordered=false",
        layout: "horizontal",
      })}
      {renderColonBehaviorVariant({
        heading: "Vertical / bordered=false",
        layout: "vertical",
      })}
    </div>
  );
}
```

**Step 2: Run targeted verification to confirm the story file compiles**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected:
- If the workspace baseline is clean: PASS
- If unrelated baseline failures exist elsewhere, there must be no new TypeScript errors in `src/components/descriptions/descriptions.stories.tsx`

**Step 3: Implement the minimal story change**

Apply only the story-local change above. Do not change:
- `descriptionItems`
- `descriptionsTitle`
- `CompareSizes`
- component logic in `descriptions.tsx`
- ordering of the existing second and third examples

**Step 4: Run targeted lint verification**

Run:

```bash
pnpm -F @acme/ui exec eslint --flag unstable_native_nodejs_ts_config "src/components/descriptions/descriptions.stories.tsx"
```

Expected:
- PASS with no lint errors in the story file

**Step 5: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "docs: add colon false descriptions story variant"
```

### Task 2: Verify the new visual comparison order in Storybook

**Files:**
- Verify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`
- Reference: `@acme/ui/package.json:8-22`

**Step 1: Open the Storybook story**

Run if needed:

```bash
pnpm -F @acme/ui storybook
```

Then open:

```text
http://localhost:6006/?path=/story/components-descriptions--compare-colon-behavior
```

**Step 2: Verify the section order and behavior**

Confirm the story renders three vertically stacked sections in this order:
1. `Horizontal / bordered=false / colon=false`
2. `Horizontal / bordered=false`
3. `Vertical / bordered=false`

Confirm visually:
- the first horizontal section does not render colons after labels
- the second horizontal section still renders colons after labels
- the vertical section remains unchanged below them

**Step 3: Re-run the story-file lint check after visual verification**

Run:

```bash
pnpm -F @acme/ui exec eslint --flag unstable_native_nodejs_ts_config "src/components/descriptions/descriptions.stories.tsx"
```

Expected:
- PASS with no lint errors

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: verify colon false descriptions story order"
```
