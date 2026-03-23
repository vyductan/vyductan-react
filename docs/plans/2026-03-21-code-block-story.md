# CodeBlock Story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Storybook story for the existing `CodeBlock` component that follows the existing component-story style used in `@acme/ui`.

**Architecture:** Implement a colocated Storybook file beside the component. Reuse the existing public component API without changing production logic. Provide one interactive playground story plus a few preset stories for common snippet types.

**Tech Stack:** React, TypeScript, Storybook (`@storybook/nextjs-vite`), PNPM

---

### Task 1: Inspect existing story conventions

**Files:**
- Read: `@acme/ui/src/components/button/button.stories.tsx`
- Read: `@acme/ui/src/components/code-block/code-block.tsx`
- Create: none
- Modify: none
- Test: none

**Step 1: Review the reference story**

Read `@acme/ui/src/components/button/button.stories.tsx` and note:
- meta shape
- title naming
- `StoryObj` usage
- argTypes patterns

**Step 2: Review the target component API**

Read `@acme/ui/src/components/code-block/code-block.tsx` and confirm the only inputs needed for the story are:
- `language`
- `children`

**Step 3: Commit**

No commit for this inspection-only task.

### Task 2: Write the story file

**Files:**
- Create: `@acme/ui/src/components/code-block/code-block.stories.tsx`
- Read: `@acme/ui/src/components/code-block/code-block.tsx`
- Test: Storybook manual preview

**Step 1: Write the failing test equivalent**

Because this task is Storybook-only and no existing automated story test is required, the red step is to create the story file with the expected stories and then verify Storybook initially fails typecheck or preview if the file shape is wrong.

Expected exported stories:
- `Playground`
- `TypeScript`
- `Shell`
- `PlainTextFallback`

**Step 2: Create minimal story implementation**

Implement `@acme/ui/src/components/code-block/code-block.stories.tsx` with:
- `title: "Components/CodeBlock"`
- `component: CodeBlock`
- `parameters.layout` set to a sensible layout such as `padded`
- `argTypes.language` using a select control with curated options
- `argTypes.children` using a text control
- sample multiline snippets stored as local constants
- one `Playground` story with editable args
- three preset stories using realistic snippet values

Suggested snippet themes:
- TypeScript function example
- shell install/run commands
- plain text/fallback content

**Step 3: Verify the story file compiles**

Run: `pnpm -F @acme/ui test -- --runInBand`

Expected:
- existing tests remain green
- no Storybook typing issues are introduced by the new story file

If this command is too broad or unrelated, use the smallest available validation command that checks TypeScript/story compilation in `@acme/ui`.

**Step 4: Manually validate in Storybook**

Run one of:
- `pnpm -F @acme/ui storybook`
- or the project’s usual Storybook dev command

Verify:
- `Components/CodeBlock` appears in the sidebar
- `Playground` renders and responds to controls
- preset stories render readable multiline code blocks

**Step 5: Commit**

```bash
git add @acme/ui/src/components/code-block/code-block.stories.tsx docs/plans/2026-03-21-code-block-story-design.md docs/plans/2026-03-21-code-block-story.md
git commit -m "feat: add code block storybook stories"
```

### Task 3: Review and simplify the result

**Files:**
- Modify: `@acme/ui/src/components/code-block/code-block.stories.tsx` if needed
- Test: same validation commands as Task 2

**Step 1: Review for YAGNI**

Ensure the story file does not add:
- unnecessary helper components
- demo subfiles
- interaction tests not requested
- extra props not supported by the component

**Step 2: Keep only the minimal useful stories**

Retain only:
- `Playground`
- `TypeScript`
- `Shell`
- `PlainTextFallback`

**Step 3: Re-run validation**

Run the same `pnpm` validation used in Task 2.

Expected:
- clean output
- no new failures

**Step 4: Commit**

If changes were needed after review:

```bash
git add @acme/ui/src/components/code-block/code-block.stories.tsx
git commit -m "refactor: simplify code block stories"
```
