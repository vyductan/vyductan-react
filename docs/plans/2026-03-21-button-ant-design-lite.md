# Button Ant Design-lite shared examples Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor Button docs and visual stories to share example sources using an Ant Design-lite structure where each visual example has a `demo/*.tsx` component and a paired `demo/*.md` docs fragment.

**Architecture:** Keep `demo/*.tsx` as the canonical source for visual example JSX. Add paired `demo/*.md` files for per-example docs text, then convert `button.mdx` into an assembler that imports both the demo components and the markdown fragments. Reuse the same demo components from `button.stories.tsx` for visual stories only, while leaving interaction/test stories independent.

**Tech Stack:** React 19, TypeScript, Storybook 10 (`@storybook/nextjs-vite`), MDX, Vite, Vitest, PNPM workspace, `@acme/ui`

---

### Task 1: Prove the current setup does not yet follow the Ant Design-lite pattern

**Files:**
- Modify: `@acme/ui/src/components/button/button.docs-config.test.ts`
- Reference: `@acme/ui/src/components/button/button.mdx`
- Reference: `@acme/ui/src/components/button/demo/*.tsx`

**Step 1: Write the failing test**

Extend `@acme/ui/src/components/button/button.docs-config.test.ts` with a new test that asserts:
- `button.mdx` imports the markdown fragments for the visual examples
- each visual example has a matching `.md` file path referenced in the docs assembly pattern

Suggested expectations:

```ts
test("assembles visual Button docs from demo markdown fragments", () => {
  const docsSource = readFileSync(resolve(import.meta.dirname, "./button.mdx"), "utf8");

  expect(docsSource).toContain('from "./demo/basic.md"');
  expect(docsSource).toContain('from "./demo/color-variant.md"');
  expect(docsSource).toContain('from "./demo/sizes.md"');
  expect(docsSource).toContain('from "./demo/danger.md"');
  expect(docsSource).toContain('from "./demo/disabled.md"');
  expect(docsSource).toContain('from "./demo/loading.md"');
  expect(docsSource).toContain('from "./demo/icon.md"');
  expect(docsSource).toContain('from "./demo/with-icon.md"');
});
```

Keep the existing docs config regression test and the existing live-demo regression test.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL because `button.mdx` does not import any `demo/*.md` files yet

**Step 3: Write minimal implementation target**

Do not modify implementation files yet. The test should stay red until the markdown-fragment structure exists.

**Step 4: Re-run the targeted test after implementation**

Run the same command and expect PASS once Tasks 2–4 are complete.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.docs-config.test.ts @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/demo/*.md
git commit -m "test: lock button ant design lite docs structure"
```

### Task 2: Add per-example markdown fragments for visual Button docs

**Files:**
- Create: `@acme/ui/src/components/button/demo/basic.md`
- Create: `@acme/ui/src/components/button/demo/color-variant.md`
- Create: `@acme/ui/src/components/button/demo/sizes.md`
- Create: `@acme/ui/src/components/button/demo/danger.md`
- Create: `@acme/ui/src/components/button/demo/disabled.md`
- Create: `@acme/ui/src/components/button/demo/loading.md`
- Create: `@acme/ui/src/components/button/demo/icon.md`
- Create: `@acme/ui/src/components/button/demo/with-icon.md`
- Reference: `@acme/ui/src/components/button/button.mdx`

**Step 1: Write the failing test**

Use the Task 1 red test as the failing test for this structure.

**Step 2: Run the targeted test and keep it red**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- Still FAIL because the docs assembly has not imported the new markdown fragments yet

**Step 3: Write minimal markdown fragments**

Create short docs fragments containing only the per-example descriptive prose. Keep them markdown-only and small.

Suggested content:

`basic.md`
```md
The simplest way to use Button with different types.
```

`color-variant.md`
```md
You can combine different colors and variants to create various button styles.
```

`sizes.md`
```md
Use different sizes to match the visual weight and density of the surrounding UI.
```

`danger.md`
```md
Use danger buttons to emphasize destructive or irreversible actions.
```

`disabled.md`
```md
Disabled buttons communicate unavailable actions while preserving layout and intent.
```

`loading.md`
```md
Loading buttons indicate in-progress actions and help prevent duplicate submissions.
```

`icon.md`
```md
Icon-only buttons should always include an accessible label that describes the action.
```

`with-icon.md`
```md
The spacing between the icon and the text is automatically adjusted based on the size of the button.
```

**Step 4: Verify the files exist and stay format-safe**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- Still FAIL because `button.mdx` has not been wired to these `.md` files yet

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/demo/basic.md @acme/ui/src/components/button/demo/color-variant.md @acme/ui/src/components/button/demo/sizes.md @acme/ui/src/components/button/demo/danger.md @acme/ui/src/components/button/demo/disabled.md @acme/ui/src/components/button/demo/loading.md @acme/ui/src/components/button/demo/icon.md @acme/ui/src/components/button/demo/with-icon.md
git commit -m "docs: add button demo markdown fragments"
```

### Task 3: Teach the Button docs page to assemble from `demo/*.md`

**Files:**
- Modify: `@acme/ui/src/components/button/button.mdx`
- Reference: `@acme/ui/src/components/button/demo/*.md`
- Reference: `@acme/ui/src/components/button/demo/*.tsx`
- Reference: `@acme/ui/.storybook/main.ts`

**Step 1: Write the failing test**

Use the Task 1 red test as the failing test for this task.

**Step 2: Run the targeted test to confirm the red state**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL because `button.mdx` still inlines prose and does not import `demo/*.md`

**Step 3: Write minimal docs assembly implementation**

Update `button.mdx` to:
1. Import the `.md` fragments for the eight visual examples.
2. Render the imported markdown content in the relevant sections.
3. Preserve the existing `ComponentSource` blocks and section order.
4. Leave these sections unchanged as code examples:
   - Link as Button
   - Form Integration
   - Migration from Ant Design

Use the smallest viable implementation that works with the existing Storybook/Vite/MDX toolchain. If direct `.md` import requires a raw import query or minimal Vite config support, use that exact minimal approach and document it in code comments only if necessary.

Implementation target sketch:

```mdx
import basicDocs from "./demo/basic.md";
import colorVariantDocs from "./demo/color-variant.md";
// ...

{basicDocs}
<ComponentSource src="button/demo/basic.tsx" __comp__={BasicDemo} />
```

If raw markdown strings are imported, render them through the smallest existing/inline markdown rendering path already available in the repo. Do not introduce a broad docs framework refactor.

**Step 4: Run the targeted test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/demo/*.md @acme/ui/.storybook/main.ts @acme/ui/src/components/button/button.docs-config.test.ts
git commit -m "docs: assemble button docs from demo markdown fragments"
```

### Task 4: Refactor visual Button stories to reuse the demo `.tsx` components

**Files:**
- Modify: `@acme/ui/src/components/button/button.stories.tsx`
- Reference: `@acme/ui/src/components/button/demo/basic.tsx`
- Reference: `@acme/ui/src/components/button/demo/color-variant.tsx`
- Reference: `@acme/ui/src/components/button/demo/sizes.tsx`
- Reference: `@acme/ui/src/components/button/demo/danger.tsx`
- Reference: `@acme/ui/src/components/button/demo/disabled.tsx`
- Reference: `@acme/ui/src/components/button/demo/loading.tsx`
- Reference: `@acme/ui/src/components/button/demo/icon.tsx`
- Reference: `@acme/ui/src/components/button/demo/with-icon.tsx`

**Step 1: Write the failing test by encoding the reuse target in story structure**

Add or update a focused story-level regression test file if needed only after checking whether `button.docs-config.test.ts` is insufficient. Prefer a text-level assertion file over broad Storybook runtime tests.

Suggested minimal assertion target:
- visual stories import and render shared demo components rather than duplicating JSX inline for the corresponding examples

Possible file:
`@acme/ui/src/components/button/button.story-structure.test.ts`

Suggested structure:

```ts
test("button visual stories reuse shared demo components", () => {
  const storiesSource = readFileSync(resolve(import.meta.dirname, "./button.stories.tsx"), "utf8");

  expect(storiesSource).toContain('import SizesDemo from "./demo/sizes"');
  expect(storiesSource).toContain('import WithIconDemo from "./demo/with-icon"');
  expect(storiesSource).toContain('render: () => <SizesDemo />');
});
```

Only create this test if needed to keep TDD honest for the story refactor.

**Step 2: Run the targeted test to verify it fails**

Run one of:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.story-structure.test.ts
```

or, if you extended an existing file:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL until `button.stories.tsx` reuses the shared demo components

**Step 3: Write minimal story reuse implementation**

Refactor the visual stories that map cleanly to the shared demos, such as:
- `Sizes`
- `WithIcon`
- `IconOnly`
- `Loading`
- `Disabled`
- optionally `Default` / `Primary` if they cleanly match `basic.tsx`
- optionally `Variants` / `Colors` only if they cleanly map to `color-variant.tsx` without adding awkward story coupling

Keep independent:
- controls-oriented stories that need args-specific variation
- interaction/play-function stories

Prefer simple render wrappers like:

```tsx
import SizesDemo from "./demo/sizes";

export const Sizes: Story = {
  render: () => <SizesDemo />,
};
```

**Step 4: Run the relevant test and typecheck**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.story-structure.test.ts
pnpm -F @acme/ui typecheck
```

Expected:
- story-structure test passes
- typecheck passes

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.stories.tsx @acme/ui/src/components/button/button.story-structure.test.ts @acme/ui/src/components/button/demo/*.tsx
git commit -m "refactor: reuse button demos in visual stories"
```

### Task 5: Verify the Ant Design-lite Button docs and stories end-to-end

**Files:**
- Verify: `@acme/ui/src/components/button/button.mdx`
- Verify: `@acme/ui/src/components/button/button.stories.tsx`
- Verify: `@acme/ui/src/components/button/demo/*.tsx`
- Verify: `@acme/ui/src/components/button/demo/*.md`

**Step 1: Run the focused automated checks**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts src/components/button/button.story-structure.test.ts
pnpm -F @acme/ui typecheck
```

Expected:
- PASS

If no `button.story-structure.test.ts` was needed, run only the docs test plus typecheck.

**Step 2: Open the docs page in Storybook**

Use:

```text
http://localhost:6006/?path=/docs/components-button--docs
```

Confirm:
- imported markdown text renders under each visual section
- each visual section still renders a live preview via `ComponentSource`
- `Link as Button` remains a code block
- `Form Integration` remains a code block
- Button props still render as a table

**Step 3: Open the mapped visual stories in Storybook**

Check these stories if they were refactored:
- `/?path=/story/components-button--sizes`
- `/?path=/story/components-button--with-icon`
- `/?path=/story/components-button--icon-only`
- `/?path=/story/components-button--loading`
- `/?path=/story/components-button--disabled`

Confirm they still render correctly after reusing the shared demo components.

**Step 4: Re-run final verification**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts src/components/button/button.story-structure.test.ts
pnpm -F @acme/ui typecheck
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.docs-config.test.ts @acme/ui/src/components/button/button.story-structure.test.ts @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/button.stories.tsx @acme/ui/src/components/button/demo/*.tsx @acme/ui/src/components/button/demo/*.md @acme/ui/.storybook/main.ts
git commit -m "refactor: share button docs and story examples"
```
