# Card Size Story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the `Sizes` Storybook story so it visually matches the user's simpler example while still comparing the default and `small` Card variants.

**Architecture:** Keep the change limited to `@acme/ui/src/components/card/card.stories.tsx`. Rework the `Sizes` story so both cards share the same compact structure, centered width, short copy, and full-width footer action, while continuing to use the existing local Card API (`size="small"`). Verify with a targeted `@acme/ui` typecheck.

**Tech Stack:** React, TypeScript, Storybook, Tailwind CSS, `@acme/ui`, PNPM

---

### Task 1: Update the `Sizes` story layout and content

**Files:**
- Modify: `@acme/ui/src/components/card/card.stories.tsx`
- Reference: `@acme/ui/src/components/card/card.tsx`
- Reference: `docs/plans/2026-03-19-card-size-story-design.md`

**Step 1: Write the failing test**

Add a temporary placeholder version of the `Sizes` story render that preserves the story export but does not yet satisfy the approved presentation:

```tsx
export const Sizes: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => null,
};
```

This intentionally removes the current story body so the implementation step can replace it with the approved structure.

**Step 2: Run test to verify it fails**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck
```

Expected:
- Typecheck may still pass because Storybook stories are not behavior-tested here.
- If it passes, treat this as acceptable for a story-only TDD checkpoint and proceed to the implementation step.
- If it fails due to malformed JSX or story typing, that also confirms the placeholder is incomplete.

**Step 3: Write minimal implementation**

Replace the placeholder with the approved side-by-side comparison that matches the user's example style more closely:

```tsx
export const Sizes: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">Default</p>
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>
              This card uses the default size variant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              The default card keeps the standard spacing for a more relaxed layout.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Action
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">Small</p>
        <Card size="small" className="mx-auto w-full max-w-sm">
          <CardHeader>
            <CardTitle>Small Card</CardTitle>
            <CardDescription>
              This card uses the small size variant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              The small card uses more compact spacing for tighter layouts.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Action
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  ),
};
```

Implementation notes:
- Keep the story name as `Sizes`.
- Keep `layout: "padded"`.
- Use `size="small"`, not `size="sm"`, because the current Card API supports `small`.
- Keep the button full width to match the requested example style.
- Do not change any Card component logic.

**Step 4: Run test to verify it passes**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck
```

Expected:
- Command succeeds without TypeScript errors.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/card/card.stories.tsx
git commit -m "feat: refresh Card sizes story layout"
```

### Task 2: Verify the story still communicates size comparison clearly

**Files:**
- Review: `@acme/ui/src/components/card/card.stories.tsx`
- Reference: `docs/plans/2026-03-19-card-size-story-design.md`

**Step 1: Write the failing test**

Create this manual verification checklist before re-reading the story:

```text
- Story name remains Sizes
- Uses layout: padded
- Shows both Default and Small cards
- Both cards use the same simplified structure
- Both cards use className="mx-auto w-full max-w-sm"
- Small card uses size="small"
- Footer action is full width in both cards
- No Card component files were modified
```

**Step 2: Run test to verify it fails**

Re-read `@acme/ui/src/components/card/card.stories.tsx` and compare it against the checklist.

Expected:
- If any checklist item is missing or inconsistent, treat verification as failing and fix only that gap.

**Step 3: Write minimal implementation**

Apply only the smallest story-file edit needed to satisfy any failed checklist item.

Examples of acceptable fixes:
- restore `mx-auto w-full max-w-sm` if one card is missing it
- align one card's structure to match the other
- restore `size="small"` if the wrong API value was used

**Step 4: Run test to verify it passes**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck
```

Expected:
- Command succeeds without TypeScript errors after the final story review.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/card/card.stories.tsx
git commit -m "chore: verify Card sizes story presentation"
```
