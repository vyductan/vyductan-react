# @acme/ui Typecheck Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `pnpm -F @acme/ui typecheck` pass by removing invalid app-style imports from editor files and keeping the package’s existing `@acme/ui/components/*` import convention.

**Architecture:** The failure is caused by duplicated imports in seven editor files. Each file currently imports the same symbols twice: once from an invalid `@/components/ui/*` alias and once from the package-local `@acme/ui/components/*` path. The fix is to remove the invalid alias imports only, keep the existing valid imports, and re-run typecheck to confirm there are no remaining TypeScript errors.

**Tech Stack:** PNPM, TypeScript, React, Lexical, @acme/ui

---

### Task 1: Remove invalid imports from editor action plugins

**Files:**
- Modify: `@acme/ui/src/components/editor/plugins/actions/edit-mode-toggle-plugin.tsx:1-16`
- Modify: `@acme/ui/src/components/editor/plugins/actions/import-export-plugin.tsx:1-16`
- Modify: `@acme/ui/src/components/editor/plugins/actions/markdown-toggle-plugin.tsx:1-12`
- Modify: `@acme/ui/src/components/editor/plugins/actions/share-content-plugin.tsx:1-23`
- Test: `pnpm -F @acme/ui typecheck`

**Step 1: Write the failing test**

Use the existing package typecheck command as the failing regression test.

```bash
pnpm -F @acme/ui typecheck
```

Expected failures include these representative errors:
- `TS2307: Cannot find module '@/components/ui/button'`
- `TS2300: Duplicate identifier 'Button'`
- `TS2300: Duplicate identifier 'TooltipContent'`

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected: FAIL with duplicate identifier errors and unresolved `@/components/ui/*` imports in the editor action plugin files.

**Step 3: Write minimal implementation**

In each of the four files above:
- Delete the `@/components/ui/button` import if present.
- Delete the `@/components/ui/tooltip` import if present.
- Keep the existing `@acme/ui/components/button` import.
- Keep the existing `@acme/ui/components/tooltip` import.
- Do not rename symbols or refactor component logic.

The resulting import blocks should look like this shape:

```tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LockIcon, UnlockIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";
```

For `markdown-toggle-plugin.tsx`, keep only:

```tsx
import { Button } from "@acme/ui/components/button";
```

**Step 4: Run test to verify progress**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected: the action plugin import errors are gone. Remaining failures, if any, should only be in the block format files.

**Step 5: Commit**

Do not commit unless the user explicitly asks.

---

### Task 2: Remove invalid imports from block format toolbar files

**Files:**
- Modify: `@acme/ui/src/components/editor/plugins/toolbar/block-format/format-code-block.tsx:1-6`
- Modify: `@acme/ui/src/components/editor/plugins/toolbar/block-format/format-paragraph.tsx:1-9`
- Modify: `@acme/ui/src/components/editor/plugins/toolbar/block-format/format-quote.tsx:1-6`
- Test: `pnpm -F @acme/ui typecheck`

**Step 1: Write the failing test**

Use the same package typecheck command and focus on the remaining import errors in the block format files.

```bash
pnpm -F @acme/ui typecheck
```

Expected failures include these representative errors:
- `TS2307: Cannot find module '@/components/ui/select'`
- `TS2300: Duplicate identifier 'SelectItem'`

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected: FAIL with unresolved `@/components/ui/select` imports and duplicate `SelectItem` identifiers in the three block format files.

**Step 3: Write minimal implementation**

In each of the three files above:
- Delete the `@/components/ui/select` import.
- Keep the existing `@acme/ui/components/select` import.
- Do not change any formatting logic or event handlers.

The resulting import block should look like this shape:

```tsx
import { $createCodeNode } from "@lexical/code";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";

import { SelectItem } from "@acme/ui/components/select";
```

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected: PASS with no TypeScript errors.

**Step 5: Commit**

Do not commit unless the user explicitly asks.

---

### Task 3: Final verification

**Files:**
- Test only: `@acme/ui`

**Step 1: Run final verification**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected: PASS.

**Step 2: Inspect touched files**

Verify only these seven files changed:
- `@acme/ui/src/components/editor/plugins/actions/edit-mode-toggle-plugin.tsx`
- `@acme/ui/src/components/editor/plugins/actions/import-export-plugin.tsx`
- `@acme/ui/src/components/editor/plugins/actions/markdown-toggle-plugin.tsx`
- `@acme/ui/src/components/editor/plugins/actions/share-content-plugin.tsx`
- `@acme/ui/src/components/editor/plugins/toolbar/block-format/format-code-block.tsx`
- `@acme/ui/src/components/editor/plugins/toolbar/block-format/format-paragraph.tsx`
- `@acme/ui/src/components/editor/plugins/toolbar/block-format/format-quote.tsx`

**Step 3: Confirm no extra cleanup**

Do not:
- add path aliases
- refactor imports across unrelated files
- change editor behavior
- modify public APIs

**Step 4: Commit**

Do not commit unless the user explicitly asks.
