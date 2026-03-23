# Button live docs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the visual Button examples in the Button MDX docs from fenced code blocks into live `ComponentSource` demos so they render like the existing Basic Usage and Color & Variant sections.

**Architecture:** Keep the change local to `@acme/ui/src/components/button`. Reuse existing demo components where they already exist, add minimal new demo files only for visual showcase sections that should render live previews, and leave integration-focused sections (`Link as Button`, `Form Integration`) as code examples. Protect the change with a regression test that checks the Button MDX file uses `ComponentSource` for the expected live-demo sections.

**Tech Stack:** React 19, TypeScript, MDX, Storybook 10 (`@storybook/nextjs-vite`), Vitest, PNPM workspace, `@acme/ui`

---

### Task 1: Lock in the expected live-demo sections with a failing test

**Files:**
- Modify: `@acme/ui/src/components/button/button.docs-config.test.ts`
- Reference: `@acme/ui/src/components/button/button.mdx`

**Step 1: Write the failing test**

Extend the existing text-level docs regression test so it also verifies that `button.mdx` uses `ComponentSource` for these sections:
- `Different Sizes`
- `Button Types`
- `Danger Button`
- `Disabled State`
- `Loading State`
- `Icon Button`
- `Button with Icon`

Suggested structure:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

describe("Button docs Storybook config", () => {
  test("configures addon-docs with remark-gfm so markdown tables render as tables in MDX docs", () => {
    const configSource = readFileSync(
      resolve(import.meta.dirname, "../../../.storybook/main.ts"),
      "utf8",
    );

    expect(configSource).toContain('name: "@storybook/addon-docs"');
    expect(configSource).toContain("mdxPluginOptions");
    expect(configSource).toContain("remarkPlugins: [remarkGfm]");
  });

  test("renders visual Button sections as live ComponentSource demos", () => {
    const mdxSource = readFileSync(
      resolve(import.meta.dirname, "./button.mdx"),
      "utf8",
    );

    expect(mdxSource).toContain("### Different Sizes");
    expect(mdxSource).toContain('src="button/demo/sizes.tsx"');
    expect(mdxSource).toContain("### Button Types");
    expect(mdxSource).toContain('src="button/demo/types.tsx"');
    expect(mdxSource).toContain("### Danger Button");
    expect(mdxSource).toContain('src="button/demo/danger.tsx"');
    expect(mdxSource).toContain("### Disabled State");
    expect(mdxSource).toContain('src="button/demo/disabled.tsx"');
    expect(mdxSource).toContain("### Loading State");
    expect(mdxSource).toContain('src="button/demo/loading.tsx"');
    expect(mdxSource).toContain("### Icon Button");
    expect(mdxSource).toContain('src="button/demo/icon.tsx"');
    expect(mdxSource).toContain("### Button with Icon");
    expect(mdxSource).toContain('src="button/demo/with-icon.tsx"');
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL because the new `ComponentSource` entries and demo file references are not in `button.mdx` yet

**Step 3: Write minimal implementation target**

Do not change the test again unless the failure shows a typo in the expectation paths.

**Step 4: Re-run the test after implementation**

Run the same command and expect PASS.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.docs-config.test.ts @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/demo/*.tsx
git commit -m "docs: render button examples as live demos"
```

### Task 2: Add the missing Button demo components

**Files:**
- Create: `@acme/ui/src/components/button/demo/sizes.tsx`
- Create: `@acme/ui/src/components/button/demo/types.tsx`
- Create: `@acme/ui/src/components/button/demo/loading.tsx`
- Create: `@acme/ui/src/components/button/demo/icon.tsx`
- Create: `@acme/ui/src/components/button/demo/with-icon.tsx`
- Reference: `@acme/ui/src/components/button/demo/basic.tsx`
- Reference: `@acme/ui/src/components/button/demo/color-variant.tsx`
- Reference: `@acme/ui/src/components/button/demo/danger.tsx`
- Reference: `@acme/ui/src/components/button/demo/disabled.tsx`

**Step 1: Write the failing test**

The Task 1 test is already the failing test for these files because it expects the corresponding `src="button/demo/*.tsx"` entries in the MDX document.

**Step 2: Run the targeted test to keep it red**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- Still FAIL until both the new demo files exist and `button.mdx` references them

**Step 3: Write minimal demo implementations**

Use the same default-export pattern as the existing demo files.

`@acme/ui/src/components/button/demo/sizes.tsx`

```tsx
import type React from "react";

import { Icon } from "@acme/ui/components/icon";
import { Button } from "@acme/ui/components/button";
import { Flex } from "@acme/ui/components/flex";

const App: React.FC = () => (
  <Flex gap="small" vertical>
    <Flex gap="small" wrap>
      <Button size="sm" variant="outlined">Small</Button>
      <Button size="icon-sm" aria-label="Submit" variant="outlined">
        <Icon icon="icon-[lucide--arrow-up-right]" />
      </Button>
    </Flex>
    <Flex gap="small" wrap>
      <Button variant="outlined">Default</Button>
      <Button size="icon" aria-label="Submit" variant="outlined">
        <Icon icon="icon-[lucide--arrow-up-right]" />
      </Button>
    </Flex>
    <Flex gap="small" wrap>
      <Button size="lg" variant="outlined">Large</Button>
      <Button size="icon-lg" aria-label="Submit" variant="outlined">
        <Icon icon="icon-[lucide--arrow-up-right]" />
      </Button>
    </Flex>
  </Flex>
);

export default App;
```

`@acme/ui/src/components/button/demo/types.tsx`

```tsx
import type React from "react";

import { Button } from "@acme/ui/components/button";
import { Flex } from "@acme/ui/components/flex";

const App: React.FC = () => (
  <Flex gap="small" wrap>
    <Button type="primary">Primary</Button>
    <Button>Default</Button>
    <Button type="dashed">Dashed</Button>
    <Button type="text">Text</Button>
    <Button type="link">Link</Button>
  </Flex>
);

export default App;
```

`@acme/ui/src/components/button/demo/loading.tsx`

```tsx
import type React from "react";

import { Button } from "@acme/ui/components/button";

const App: React.FC = () => (
  <Button type="primary" loading>
    Loading
  </Button>
);

export default App;
```

`@acme/ui/src/components/button/demo/icon.tsx`

```tsx
import type React from "react";

import { Button } from "@acme/ui/components/button";
import { Icon } from "@acme/ui/components/icon";

const App: React.FC = () => (
  <Button variant="outlined" size="icon" aria-label="Submit">
    <Icon icon="icon-[lucide--arrow-up-right]" />
  </Button>
);

export default App;
```

`@acme/ui/src/components/button/demo/with-icon.tsx`

```tsx
import type React from "react";

import { Button } from "@acme/ui/components/button";
import { Icon } from "@acme/ui/components/icon";

const App: React.FC = () => (
  <Button variant="outlined" size="sm">
    <Icon icon="icon-[lucide--git-branch]" /> New Branch
  </Button>
);

export default App;
```

**Step 4: Run typecheck for the new demo files**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected:
- If the baseline is clean: PASS
- Otherwise: no new errors in the five created demo files

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/demo/sizes.tsx @acme/ui/src/components/button/demo/types.tsx @acme/ui/src/components/button/demo/loading.tsx @acme/ui/src/components/button/demo/icon.tsx @acme/ui/src/components/button/demo/with-icon.tsx
git commit -m "docs: add button live demo components"
```

### Task 3: Convert the Button MDX sections to live ComponentSource blocks

**Files:**
- Modify: `@acme/ui/src/components/button/button.mdx`
- Reference: `@acme/ui/src/components/mdx/component-source.tsx`

**Step 1: Write the failing test**

Use the Task 1 failing test as the red phase.

**Step 2: Run test to confirm it still fails for the missing MDX wiring**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL until the fenced blocks are replaced with `ComponentSource` entries

**Step 3: Write minimal MDX implementation**

Add imports at the top:

```mdx
import DangerDemo from "./demo/danger";
import DisabledDemo from "./demo/disabled";
import SizesDemo from "./demo/sizes";
import TypesDemo from "./demo/types";
import LoadingDemo from "./demo/loading";
import IconDemo from "./demo/icon";
import WithIconDemo from "./demo/with-icon";
```

Replace only the visual showcase fenced code blocks with `ComponentSource`:

```mdx
### Different Sizes

<ComponentSource src="button/demo/sizes.tsx" __comp__={SizesDemo} />

### Button Types

<ComponentSource src="button/demo/types.tsx" __comp__={TypesDemo} />

### Danger Button

<ComponentSource src="button/demo/danger.tsx" __comp__={DangerDemo} />

### Disabled State

<ComponentSource src="button/demo/disabled.tsx" __comp__={DisabledDemo} />

### Loading State

<ComponentSource src="button/demo/loading.tsx" __comp__={LoadingDemo} />

### Icon Button

<ComponentSource src="button/demo/icon.tsx" __comp__={IconDemo} />

### Button with Icon

The spacing between the icon and the text is automatically adjusted based on the size of the button.

<ComponentSource src="button/demo/with-icon.tsx" __comp__={WithIconDemo} />
```

Leave these sections as fenced code examples:
- `Link as Button`
- `Form Integration`
- `Migration from Ant Design`

**Step 4: Run the targeted test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/demo/*.tsx @acme/ui/src/components/button/button.docs-config.test.ts
git commit -m "docs: convert button examples to live MDX demos"
```

### Task 4: Verify Storybook renders the new live previews correctly

**Files:**
- Verify: `@acme/ui/src/components/button/button.mdx`
- Verify: `@acme/ui/src/components/button/demo/*.tsx`
- Reference: `@acme/ui/package.json`

**Step 1: Start Storybook if it is not already running**

Run:

```bash
pnpm -F @acme/ui storybook
```

**Step 2: Open the Button docs page**

Use:

```text
http://localhost:6006/?path=/docs/components-button--docs
```

**Step 3: Verify the live-demo behavior**

Confirm these sections now render previews plus collapsible code instead of plain fenced code blocks:
- `Different Sizes`
- `Button Types`
- `Danger Button`
- `Disabled State`
- `Loading State`
- `Icon Button`
- `Button with Icon`

Also confirm:
- `Basic Usage` and `Color & Variant` still render correctly
- `Link as Button` still appears as a code example
- `Form Integration` still appears as a code example
- the Button props table still renders as an actual table

**Step 4: Run focused verification commands**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
pnpm -F @acme/ui typecheck
```

Expected:
- The targeted Vitest file passes
- Typecheck reports no new Button-docs-related errors

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/demo/*.tsx @acme/ui/src/components/button/button.docs-config.test.ts
git commit -m "test: verify button live docs rendering"
```
