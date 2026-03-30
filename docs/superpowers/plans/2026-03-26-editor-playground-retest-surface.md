# Editor Playground Retest Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Storybook `play` interaction from the dedicated editor `Playground` story while keeping that story as the stable clipboard retest target and leaving the retest documentation unlocked by automated tests.

**Architecture:** Keep the change local to the editor Storybook story file. Preserve the `Playground` story export, render target, and resulting story id so the Playwright clipboard retest keeps pointing at the same Storybook surface. Verification relies on direct source inspection plus the existing structure test, not on adding a new automated lock for `play` removal or for the markdown documentation file.

**Tech Stack:** Storybook, React, TypeScript, Vitest, Playwright, pnpm

---

## File Structure

### Existing files to modify
- `@acme/ui/src/components/editor/editor.stories.tsx`
  - Remove the `play` block from `Playground`.
  - Remove any `storybook/test` imports that become unused after that cleanup.

### Existing files to inspect during implementation
- `docs/superpowers/specs/2026-03-26-editor-playground-retest-surface-design.md`
  - Approved scope and verification rules.
- `@acme/ui/src/components/editor/editor.story-structure.test.ts`
  - Confirms the dedicated `Playground` story contract stays intact.
- `@acme/ui/playwright/editor-notion-clipboard.spec.mjs`
  - Confirms the clipboard retest still targets `components-editor--playground`.
- `@acme/ui/STORYBOOK_NOTION_CLIPBOARD_RETEST.md`
  - Reference only; do not modify and do not add automated locking.

### Existing files that must remain unchanged
- `@acme/ui/src/components/editor/editor.story-structure.test.ts`
- `@acme/ui/playwright/editor-notion-clipboard.spec.mjs`
- `@acme/ui/STORYBOOK_NOTION_CLIPBOARD_RETEST.md`

### Files to create
- None.

This is a single-file maintenance change. The implementation should stay narrow and avoid turning this into a broader Storybook or clipboard refactor.

---

### Task 1: Remove the `play` interaction from the dedicated `Playground` story

**Files:**
- Modify: `@acme/ui/src/components/editor/editor.stories.tsx`
- Inspect: `docs/superpowers/specs/2026-03-26-editor-playground-retest-surface-design.md`
- Inspect: `@acme/ui/src/components/editor/editor.story-structure.test.ts`
- Inspect: `@acme/ui/playwright/editor-notion-clipboard.spec.mjs`
- Test: none in this task

- [ ] **Step 1: Re-read the approved spec before editing**

Read: `docs/superpowers/specs/2026-03-26-editor-playground-retest-surface-design.md`

Expected reminders:
- keep the dedicated `Playground` story
- remove only the `play` block
- do not add a documentation existence test
- verify `play` removal by direct source inspection rather than adding a new structure assertion

- [ ] **Step 2: Re-read the current story and contract files**

Read:
- `@acme/ui/src/components/editor/editor.stories.tsx`
- `@acme/ui/src/components/editor/editor.story-structure.test.ts`
- `@acme/ui/playwright/editor-notion-clipboard.spec.mjs`

Expected findings:
- `Playground` is currently exported as a dedicated story
- the story currently contains a `play` block that uses Storybook interaction helpers
- the structure test already protects `export const Playground: Story = {` and `render: () => <PlaygroundDemo />`
- the Playwright retest still depends on `components-editor--playground`

- [ ] **Step 3: Edit `editor.stories.tsx` to remove the `play` block and trim imports**

Apply the smallest possible code change in `@acme/ui/src/components/editor/editor.stories.tsx`:
- delete the entire `play: async (...) => { ... }` block from `export const Playground`
- keep `render: () => <PlaygroundDemo />`
- remove any unused names from `storybook/test`

The file should end in this logical shape:

```tsx
export const Playground: Story = {
  render: () => <PlaygroundDemo />,
};
```

For imports, remove only the `storybook/test` helpers that became unused after deleting `play`, and keep any names that are still used elsewhere in the file, such as `fn`.

Do not rename `Playground`, do not rename `PlaygroundDemo`, and do not touch other stories.

- [ ] **Step 4: Re-read the edited source before running tests**

Read: `@acme/ui/src/components/editor/editor.stories.tsx`

Expected:
- `export const Playground: Story = {` still exists
- `render: () => <PlaygroundDemo />` still exists
- there is no `play:` block in the `Playground` story
- unused interaction imports such as `expect`, `screen`, `userEvent`, `waitFor`, and `within` are gone
- unrelated stories remain unchanged

---

### Task 2: Verify the dedicated Storybook retest surface still matches the approved contract

**Files:**
- Inspect: `@acme/ui/src/components/editor/editor.stories.tsx`
- Inspect: `@acme/ui/src/components/editor/editor.story-structure.test.ts`
- Inspect: `@acme/ui/playwright/editor-notion-clipboard.spec.mjs`
- Inspect: `@acme/ui/STORYBOOK_NOTION_CLIPBOARD_RETEST.md`
- Test: `@acme/ui/src/components/editor/editor.story-structure.test.ts`

- [ ] **Step 1: Run the focused structure test**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/editor.story-structure.test.ts
```

Expected:
- PASS
- the existing assertions still find `import PlaygroundDemo from "./demo/playground";`
- the existing assertions still find `export const Playground: Story = {`
- the existing assertions still find `render: () => <PlaygroundDemo />`

- [ ] **Step 2: Directly inspect the Storybook story file for the approved end state**

Read: `@acme/ui/src/components/editor/editor.stories.tsx`

Expected:
- `Playground` is still a dedicated story
- `Playground` has no `play` block
- only `render: () => <PlaygroundDemo />` remains in that story object

This step is required because the approved spec explicitly chose source inspection over adding a new lock for `play` removal.

- [ ] **Step 3: Confirm the Playwright retest target did not move**

Read: `@acme/ui/playwright/editor-notion-clipboard.spec.mjs`

Expected:
- `STORYBOOK_URL` still resolves to `iframe.html?id=components-editor--playground`
- no change is needed in the Playwright retest

- [ ] **Step 4: Optionally confirm the retest documentation remains reference-only**

Optional read: `@acme/ui/STORYBOOK_NOTION_CLIPBOARD_RETEST.md`

If checked, confirm:
- the file still documents the current retest workflow
- no test was added to lock its existence
- the implementation stayed within the approved scope by not editing this file

---

### Task 3: Final handoff

**Files:**
- Inspect: `@acme/ui/src/components/editor/editor.stories.tsx`
- Inspect: `@acme/ui/src/components/editor/editor.story-structure.test.ts`
- Inspect: `@acme/ui/playwright/editor-notion-clipboard.spec.mjs`
- Inspect: `docs/superpowers/specs/2026-03-26-editor-playground-retest-surface-design.md`
- Test: final result from the focused Vitest command above

- [ ] **Step 1: Prepare the implementation summary with evidence**

Summarize:
- which file changed
- that `Playground` kept the same story export and render target
- that the `play` block was removed
- which `storybook/test` imports were removed as dead code
- that the focused structure test passed
- that the Playwright retest still points at the same story id
- that no doc-locking test was added

- [ ] **Step 2: Stop after verification and wait for user direction before any broader cleanup**

Do not:
- move the removed interaction check into another file
- add new tests for `play` absence
- add tests for markdown file existence
- refactor unrelated editor stories

Expected: a minimal, verified change set aligned exactly with the approved spec.