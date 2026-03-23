# Button demo MDX partials Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep `button.mdx` as the Button docs page root while migrating visual example sections from raw markdown fragments to self-contained `demo/*.mdx` partials.

**Architecture:** Each visual example will become a `demo/*.mdx` partial that owns its own heading, prose, and `ComponentSource`, while the existing `demo/*.tsx` files remain the canonical JSX source for live previews and stories. `button.mdx` will become a thin assembler that imports section partials in order, and the docs regression test will switch from asserting `?raw` + `ReactMarkdown` to asserting `.mdx` partial composition.

**Tech Stack:** React 19, TypeScript, Storybook 10 (`@storybook/nextjs-vite`), MDX, Vite, Vitest, PNPM workspace, `@acme/ui`

---

### Task 1: Prove the docs test still expects the old raw-markdown assembly

**Files:**
- Modify: `@acme/ui/src/components/button/button.docs-config.test.ts`
- Reference: `@acme/ui/src/components/button/button.mdx`

**Step 1: Write the failing test**

Update the docs regression test so it asserts the new target pattern instead of the current raw-markdown pattern.

Required expectations:
- `button.mdx` imports `./demo/*.mdx` section partials
- `button.mdx` renders those imported section components under `## Examples`
- `button.mdx` no longer relies on `ReactMarkdown` for the visual example sections

Suggested direction:

```ts
test("assembles visual Button docs from demo mdx partials", () => {
  const docsSource = readFileSync(resolve(import.meta.dirname, "./button.mdx"), "utf8");

  expect(docsSource).toContain('import BasicSection from "./demo/basic.mdx"');
  expect(docsSource).toContain('import TypesSection from "./demo/types.mdx"');
  expect(docsSource).toContain("<BasicSection />");
  expect(docsSource).toContain("<TypesSection />");
  expect(docsSource).not.toContain('import ReactMarkdown from "react-markdown"');
  expect(docsSource).not.toContain("?raw");
});
```

Also keep a regression test that the visual example sections still exist as live `ComponentSource` demos, but update it to validate through the partial files if that becomes clearer.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL because `button.mdx` still imports `.md?raw` and `ReactMarkdown`

**Step 3: Do not modify implementation yet**

Leave production files unchanged. The test should stay red until the partial migration exists.

**Step 4: Re-run after implementation**

Run the same command after Tasks 2–3.

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.docs-config.test.ts @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/demo/*.mdx
git commit -m "test: lock button mdx partial docs structure"
```

### Task 2: Create per-demo MDX partials for all visual Button sections

**Files:**
- Create: `@acme/ui/src/components/button/demo/basic.mdx`
- Create: `@acme/ui/src/components/button/demo/color-variant.mdx`
- Create: `@acme/ui/src/components/button/demo/sizes.mdx`
- Create: `@acme/ui/src/components/button/demo/types.mdx`
- Create: `@acme/ui/src/components/button/demo/danger.mdx`
- Create: `@acme/ui/src/components/button/demo/disabled.mdx`
- Create: `@acme/ui/src/components/button/demo/loading.mdx`
- Create: `@acme/ui/src/components/button/demo/icon.mdx`
- Create: `@acme/ui/src/components/button/demo/with-icon.mdx`
- Reference: `@acme/ui/src/components/button/demo/*.tsx`
- Reference: `@acme/ui/src/components/button/button.mdx`

**Step 1: Use the failing Task 1 test as the red state**

No new test file is required if Task 1 already captures the migration target.

**Step 2: Run the targeted test and keep it red**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- Still FAIL because `button.mdx` has not been rewired to import `.mdx` partials yet

**Step 3: Write minimal MDX partials**

Each partial should be self-contained and follow this exact pattern:

```mdx
import { ComponentSource } from "@acme/ui/components/mdx";
import BasicDemo from "./basic";

### Basic Usage

The simplest way to use Button with different types.

<ComponentSource src="button/demo/basic.tsx" __comp__={BasicDemo} />
```

Create matching partials for all visual sections.

Suggested headings and prose:
- `basic.mdx` → `### Basic Usage`
- `color-variant.mdx` → `### Color & Variant`
- `sizes.mdx` → `### Different Sizes`
- `types.mdx` → `### Button Types`
- `danger.mdx` → `### Danger Button`
- `disabled.mdx` → `### Disabled State`
- `loading.mdx` → `### Loading State`
- `icon.mdx` → `### Icon Button`
- `with-icon.mdx` → `### Button with Icon`

For prose, reuse the current Button docs copy where it exists, and add one short sentence for `types.mdx` so it is no longer the lone special case.

**Step 4: Re-run the targeted test**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- Still FAIL because `button.mdx` has not yet imported these partials

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/demo/*.mdx
git commit -m "docs: add button demo mdx partials"
```

### Task 3: Reassemble `button.mdx` from `demo/*.mdx` partials

**Files:**
- Modify: `@acme/ui/src/components/button/button.mdx`
- Reference: `@acme/ui/src/components/button/demo/*.mdx`
- Reference: `@acme/ui/src/components/button/button.docs-config.test.ts`

**Step 1: Use the failing Task 1 test as the red state**

No extra test is needed if the docs regression test already asserts the intended import/render pattern.

**Step 2: Run the targeted test to confirm the red state**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL because `button.mdx` still uses raw markdown imports and `ReactMarkdown`

**Step 3: Write minimal docs assembly implementation**

Update `button.mdx` to:
1. Remove `ReactMarkdown` import.
2. Remove all `*.md?raw` imports.
3. Import section partial components from `./demo/*.mdx`.
4. Render those section components in order under `## Examples`.
5. Keep the page-level intro/features/API/code-only sections intact.

Implementation target sketch:

```mdx
import BasicSection from "./demo/basic.mdx";
import ColorVariantSection from "./demo/color-variant.mdx";
import SizesSection from "./demo/sizes.mdx";
import TypesSection from "./demo/types.mdx";

## Examples

<BasicSection />
<ColorVariantSection />
<SizesSection />
<TypesSection />
```

Do not keep duplicate headings or duplicate `ComponentSource` blocks in the parent file.

**Step 4: Run the targeted test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/demo/*.mdx @acme/ui/src/components/button/button.docs-config.test.ts
git commit -m "docs: assemble button docs from mdx partials"
```

### Task 4: Remove obsolete raw-markdown fragments

**Files:**
- Delete: `@acme/ui/src/components/button/demo/basic.md`
- Delete: `@acme/ui/src/components/button/demo/color-variant.md`
- Delete: `@acme/ui/src/components/button/demo/sizes.md`
- Delete: `@acme/ui/src/components/button/demo/danger.md`
- Delete: `@acme/ui/src/components/button/demo/disabled.md`
- Delete: `@acme/ui/src/components/button/demo/loading.md`
- Delete: `@acme/ui/src/components/button/demo/icon.md`
- Delete: `@acme/ui/src/components/button/demo/with-icon.md`
- Reference: `@acme/ui/src/components/button/button.mdx`
- Reference: `@acme/ui/src/components/button/button.docs-config.test.ts`

**Step 1: Verify no production code still references the old `.md` files**

Use the docs test and source inspection as the guardrail. Do not delete until Task 3 is green.

**Step 2: Delete the obsolete `.md` files**

Remove only the raw markdown files that have been replaced by `.mdx` partials.

**Step 3: Run docs test and typecheck**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
pnpm -F @acme/ui typecheck
```

Expected:
- PASS

**Step 4: Commit**

```bash
git add -u @acme/ui/src/components/button/demo @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/button.docs-config.test.ts
git commit -m "refactor: remove button raw markdown fragments"
```

### Task 5: Verify Button docs and story reuse after the MDX partial migration

**Files:**
- Verify: `@acme/ui/src/components/button/button.mdx`
- Verify: `@acme/ui/src/components/button/button.story-structure.test.ts`
- Verify: `@acme/ui/src/components/button/button.stories.tsx`
- Verify: `@acme/ui/src/components/button/demo/*.mdx`
- Verify: `@acme/ui/src/components/button/demo/*.tsx`

**Step 1: Run focused automated verification**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts src/components/button/button.story-structure.test.ts
pnpm -F @acme/ui typecheck
```

Expected:
- PASS

**Step 2: Verify Storybook docs page**

Use:

```text
http://localhost:6008/?path=/docs/components-button--docs
```

Confirm:
- each visual section renders from its own partial
- each visual section still has a live preview
- `Button Types` now matches the same pattern as the other visual sections
- `Link as Button` remains a code block
- `Form Integration` remains a code block
- Button props still render as a table

**Step 3: Verify the mapped visual stories**

Use:
- `http://localhost:6008/?path=/story/components-button--sizes`
- `http://localhost:6008/?path=/story/components-button--with-icon`
- `http://localhost:6008/?path=/story/components-button--icon-only`
- `http://localhost:6008/?path=/story/components-button--loading`
- `http://localhost:6008/?path=/story/components-button--disabled`

Confirm they still render correctly after the docs partial migration.

**Step 4: Re-run final automated verification**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts src/components/button/button.story-structure.test.ts
pnpm -F @acme/ui typecheck
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.docs-config.test.ts @acme/ui/src/components/button/button.story-structure.test.ts @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/button.stories.tsx @acme/ui/src/components/button/demo/*.mdx @acme/ui/src/components/button/demo/*.tsx
git commit -m "refactor: move button docs into mdx demo partials"
```
