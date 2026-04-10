# Popover Default Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore default `Popover` spacing so `DatePicker` no longer needs `align={{ offset: [0, 8] }}`, and add Storybook docs for `Popover` following the established compare-story pattern.

**Architecture:** Fix the shared `Popover` abstraction instead of patching `DatePicker`. Keep the custom wrapper in `packages/ui/src/components/popover/_component.tsx`, but make its default behavior match the shadcn baseline for `align` and `sideOffset`, then remove the consumer-specific override in `DatePicker`. Document both the standard wrapper API and the composable API with colocated examples and a compare-style story file.

**Tech Stack:** React 19, TypeScript, Radix UI, shadcn wrappers, Vitest storybook project, Storybook 10, pnpm

---

## File Structure

### Existing files to inspect during implementation
- `packages/ui/src/shadcn/popover.tsx`
  - Source of truth for shadcn-compatible `PopoverContent` defaults (`align = "center"`, `sideOffset = 4`).
- `packages/ui/src/components/popover/_component.tsx`
  - Custom wrapper that currently renders `PopoverPrimitive.Content` directly and adds project-specific behavior (`container`, custom shadow, focus handling, scroll handling).
- `packages/ui/src/components/popover/popover.tsx`
  - Public wrapper API that derives `side`, `align`, and optional offsets from `placement` and `align.offset`.
- `packages/ui/src/components/popover/popover.test.tsx`
  - Existing runtime test file for the wrapper.
- `packages/ui/src/components/date-picker/date-picker.tsx`
  - Current consumer with `align={{ offset: [0, 8] }}` override that should be removed once wrapper defaults are fixed.
- `packages/ui/src/components/date-picker/date-picker.test.tsx`
  - Reference targeted component tests in the same area.
- `packages/ui/src/components/combobox/combobox.stories.tsx`
  - Source of truth for compare-style Storybook docs using tabs and `ComponentSource`.
- `packages/ui/src/components/combobox/combobox.stories.test.tsx`
  - Source of truth for Storybook structure tests that verify compare panels stay mounted and labeled correctly.
- `packages/ui/src/components/combobox/examples/basic.tsx`
  - Reference colocated example component style.
- `packages/ui/src/components/combobox/examples/basic-shadcn-like.tsx`
  - Reference composable-API example format.
- `packages/ui/src/components/mdx/component-source.tsx`
  - Utility used by compare stories to render demo + source.

### Files to create
- `packages/ui/src/components/popover/examples/basic.tsx`
  - Standard wrapper API example using `content`, `title`, and `description`.
- `packages/ui/src/components/popover/examples/basic-shadcn-like.tsx`
  - Composable API example using `PopoverRoot`, `PopoverTrigger`, and `PopoverContent`.
- `packages/ui/src/components/popover/examples/default-spacing.tsx`
  - Visual example showing the default gap between trigger and content without manual offsets.
- `packages/ui/src/components/popover/popover.stories.tsx`
  - Storybook compare docs and standalone spacing example.
- `packages/ui/src/components/popover/popover.stories.test.tsx`
  - Structure tests mirroring the `Combobox` compare-story assertions.

### Files to modify
- `packages/ui/src/components/popover/_component.tsx`
  - Restore shadcn-compatible defaults inside the custom wrapper.
- `packages/ui/src/components/popover/popover.tsx`
  - Preserve wrapper defaults when `align.offset` is absent instead of forcing `undefined` overrides.
- `packages/ui/src/components/popover/popover.test.tsx`
  - Add regression tests for default `sideOffset` preservation and explicit override behavior.
- `packages/ui/src/components/date-picker/date-picker.tsx`
  - Remove `align={{ offset: [0, 8] }}` from the `Popover` usage.

### Test commands to use
- `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.test.tsx`
- `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.test.tsx src/components/date-picker/date-picker.test.tsx`
- `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.stories.test.tsx`
- `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck`

---

### Task 1: Add a failing regression test for wrapper default spacing

**Files:**
- Modify: `packages/ui/src/components/popover/popover.test.tsx`
- Test: `packages/ui/src/components/popover/popover.test.tsx`

- [ ] **Step 1: Add regression tests that encode the spacing contract**

Replace `packages/ui/src/components/popover/popover.test.tsx` with this exact content:

```tsx
import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Popover } from "./index";

globalThis.React = React;

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {
    return;
  }

  unobserve() {
    return;
  }

  disconnect() {
    return;
  }
};

describe("Popover", () => {
  test("renders arrow popover content without throwing when opened", () => {
    expect(() => {
      render(
        <Popover open content={<div>Content</div>}>
          <button type="button">Trigger</button>
        </Popover>,
      );
    }).not.toThrow();

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("keeps the default bottom spacing when no align offset is provided", () => {
    render(
      <Popover open content={<div>Content</div>}>
        <button type="button">Trigger</button>
      </Popover>,
    );

    const content = document.querySelector("[data-slot='popover-content']");
    expect(content).toHaveAttribute("data-side", "bottom");
    expect(content).toHaveStyle({
      "--radix-popover-content-transform-origin": expect.any(String),
    });
    expect(content).toHaveAttribute("style", expect.stringContaining("--radix-popover-content-available-height"));
  });

  test("applies an explicit vertical offset when align.offset provides one", () => {
    render(
      <Popover open align={{ offset: [0, 8] }} content={<div>Content</div>}>
        <button type="button">Trigger</button>
      </Popover>,
    );

    const content = document.querySelector("[data-slot='popover-content']");
    expect(content).toHaveAttribute("data-side", "bottom");
  });
});
```

- [ ] **Step 2: Tighten the failing assertions so they actually prove the bug**

Before running the test, update the second and third tests in `packages/ui/src/components/popover/popover.test.tsx` to mock the Radix content component and capture `sideOffset`/`alignOffset`.

Add this mock block immediately after the existing imports:

```tsx
const capturedContentProps: Array<Record<string, unknown>> = [];

vi.mock("radix-ui", async () => {
  const actual = await vi.importActual<typeof import("radix-ui")>("radix-ui");

  return {
    ...actual,
    Popover: {
      ...actual.Popover,
      Content: ({ children, ...props }: React.ComponentProps<"div">) => {
        capturedContentProps.push(props as Record<string, unknown>);
        return <div data-slot="popover-content">{children}</div>;
      },
    },
  };
});
```

Also update the Vitest import to include `beforeEach` and `vi`:

```tsx
import { beforeEach, describe, expect, test, vi } from "vitest";
```

Add this reset block before `describe("Popover", ...)`:

```tsx
beforeEach(() => {
  capturedContentProps.length = 0;
});
```

Then replace the second and third tests with these exact assertions:

```tsx
  test("keeps the shadcn default sideOffset when no align offset is provided", () => {
    render(
      <Popover open content={<div>Content</div>}>
        <button type="button">Trigger</button>
      </Popover>,
    );

    expect(capturedContentProps.at(-1)?.sideOffset).toBe(4);
    expect(capturedContentProps.at(-1)?.alignOffset).toBeUndefined();
  });

  test("applies an explicit vertical offset when align.offset provides one", () => {
    render(
      <Popover open align={{ offset: [0, 8] }} content={<div>Content</div>}>
        <button type="button">Trigger</button>
      </Popover>,
    );

    expect(capturedContentProps.at(-1)?.sideOffset).toBe(8);
    expect(capturedContentProps.at(-1)?.alignOffset).toBe(0);
  });
```

- [ ] **Step 3: Run the regression test to verify it fails for the expected reason**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.test.tsx
```

Expected: FAIL because the current wrapper passes `undefined` `sideOffset`, so the new default-spacing assertion does not see `4`.

- [ ] **Step 4: Commit the failing regression test**

Run:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/popover/popover.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "test: define popover default spacing contract"
```

Expected: a commit containing only the failing wrapper regression test.

---

### Task 2: Restore shadcn-compatible wrapper defaults and remove the DatePicker override

**Files:**
- Modify: `packages/ui/src/components/popover/_component.tsx`
- Modify: `packages/ui/src/components/popover/popover.tsx`
- Modify: `packages/ui/src/components/date-picker/date-picker.tsx`
- Test: `packages/ui/src/components/popover/popover.test.tsx`

- [ ] **Step 1: Restore wrapper defaults in `_component.tsx`**

Update the `PopoverContent` parameter destructuring in `packages/ui/src/components/popover/_component.tsx` from:

```tsx
const PopoverContent = ({
  container,

  style,
  className,
  align,
  sideOffset,
```

to:

```tsx
const PopoverContent = ({
  container,

  style,
  className,
  align = "center",
  sideOffset = 4,
```

Keep the rest of the file unchanged.

- [ ] **Step 2: Stop `popover.tsx` from erasing those defaults**

Update the `PopoverContent` usage in `packages/ui/src/components/popover/popover.tsx` from:

```tsx
      <PopoverContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(arrow ? "border-none" : "", "w-auto", className)}
```

to:

```tsx
      <PopoverContent
        side={side}
        {...(sideOffset === undefined ? {} : { sideOffset })}
        align={align}
        {...(alignOffset === undefined ? {} : { alignOffset })}
        className={cn(arrow ? "border-none" : "", "w-auto", className)}
```

- [ ] **Step 3: Remove the `DatePicker`-specific spacing patch**

Delete this line from `packages/ui/src/components/date-picker/date-picker.tsx`:

```tsx
        align={{ offset: [0, 8] }}
```

- [ ] **Step 4: Run the popover regression test to verify the fix passes**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.test.tsx
```

Expected: PASS for the default-spacing regression and the explicit-offset regression.

- [ ] **Step 5: Commit the shared spacing fix**

Run:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/popover/_component.tsx packages/ui/src/components/popover/popover.tsx packages/ui/src/components/date-picker/date-picker.tsx packages/ui/src/components/popover/popover.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "fix: restore popover default spacing"
```

Expected: a commit containing the wrapper fix and removal of the `DatePicker` override.

---

### Task 3: Verify the DatePicker consumer still works with shared defaults

**Files:**
- Verify: `packages/ui/src/components/date-picker/date-picker.tsx`
- Test: `packages/ui/src/components/date-picker/date-picker.test.tsx`
- Test: `packages/ui/src/components/popover/popover.test.tsx`

- [ ] **Step 1: Run the related DatePicker and Popover tests together**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.test.tsx src/components/date-picker/date-picker.test.tsx
```

Expected: PASS for both files, proving the shared spacing fix does not regress existing date-picker behavior.

- [ ] **Step 2: Add a focused DatePicker regression only if the combined run exposes a spacing-specific failure**

If the previous command fails because `DatePicker` still implicitly depends on manual spacing, append this test to `packages/ui/src/components/date-picker/date-picker.test.tsx`:

```tsx
  test("opens the calendar without a manual popover offset override", async () => {
    const user = userEvent.setup();

    render(<DatePicker defaultValue={dayjs("2024-05-15")} />);

    const input = screen.getByRole("textbox");
    await user.click(input);

    const popover = document.querySelector("[data-slot='popover-content']");
    expect(popover).toBeTruthy();
    expect(popover).toHaveAttribute("data-side", "bottom");
  });
```

Then rerun:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.test.tsx src/components/date-picker/date-picker.test.tsx
```

Expected: PASS. If the first combined run already passes, skip this step and do not add the extra test.

- [ ] **Step 3: Commit the consumer verification state**

If you added the extra DatePicker test, run:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/date-picker/date-picker.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "test: cover date picker popover defaults"
```

If no DatePicker test was needed, skip this commit.

---

### Task 4: Add Popover Storybook examples and compare stories

**Files:**
- Create: `packages/ui/src/components/popover/examples/basic.tsx`
- Create: `packages/ui/src/components/popover/examples/basic-shadcn-like.tsx`
- Create: `packages/ui/src/components/popover/examples/default-spacing.tsx`
- Create: `packages/ui/src/components/popover/popover.stories.tsx`

- [ ] **Step 1: Create the standard wrapper API example**

Create `packages/ui/src/components/popover/examples/basic.tsx` with this exact content:

```tsx
import { Button } from "@acme/ui/components/button";
import { Popover } from "@acme/ui/components/popover";

function BasicDemo(): React.JSX.Element {
  return (
    <Popover
      trigger="click"
      title="Popover title"
      description="This uses the standard wrapper API."
      content={<div className="text-sm">Helpful supporting content.</div>}
    >
      <Button variant="outline">Open popover</Button>
    </Popover>
  );
}

export default BasicDemo;
```

- [ ] **Step 2: Create the composable API example**

Create `packages/ui/src/components/popover/examples/basic-shadcn-like.tsx` with this exact content:

```tsx
import { Button } from "@acme/ui/components/button";
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@acme/ui/components/popover";

function BasicShadcnLikeDemo(): React.JSX.Element {
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Composable API</h4>
          <p className="text-muted-foreground text-sm">
            This example uses the lower-level trigger/content composition.
          </p>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}

export default BasicShadcnLikeDemo;
```

- [ ] **Step 3: Create the default-spacing visual example**

Create `packages/ui/src/components/popover/examples/default-spacing.tsx` with this exact content:

```tsx
import { Button } from "@acme/ui/components/button";
import { Popover } from "@acme/ui/components/popover";

function DefaultSpacingDemo(): React.JSX.Element {
  return (
    <div className="flex min-h-40 items-start justify-center pt-6">
      <Popover
        open
        trigger="click"
        content={<div className="text-sm">Default popover spacing is visible here.</div>}
      >
        <Button variant="outline">Anchor</Button>
      </Popover>
    </div>
  );
}

export default DefaultSpacingDemo;
```

- [ ] **Step 4: Create the Storybook stories file**

Create `packages/ui/src/components/popover/popover.stories.tsx` with this exact content:

```tsx
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ComponentSource } from "../mdx/component-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import BasicExample from "./examples/basic";
import BasicShadcnLikeExample from "./examples/basic-shadcn-like";
import DefaultSpacingExample from "./examples/default-spacing";
import { Popover } from "./popover";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    trigger: {
      control: "radio",
      options: ["click", "hover", "focus"],
    },
    arrow: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;
type ExampleStory = Pick<Story, "render">;

function CompareTabs({
  antLikeSrc,
  antLikeComp,
  shadcnLikeSrc,
  shadcnLikeComp,
}: {
  antLikeSrc: string;
  antLikeComp: React.FC;
  shadcnLikeSrc: string;
  shadcnLikeComp: React.FC;
}): React.JSX.Element {
  return (
    <div className="mx-auto w-full sm:w-3xl">
      <Tabs defaultValue="standard-api" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="standard-api">Standard API</TabsTrigger>
          <TabsTrigger value="composable-api">Composable API</TabsTrigger>
        </TabsList>
        <TabsContent
          value="standard-api"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ComponentSource src="popover/examples/basic.tsx" __comp__={antLikeComp} />
        </TabsContent>
        <TabsContent
          value="composable-api"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ComponentSource
            src="popover/examples/basic-shadcn-like.tsx"
            __comp__={shadcnLikeComp}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Basic: ExampleStory = {
  render: () => (
    <CompareTabs
      antLikeSrc="popover/examples/basic.tsx"
      antLikeComp={BasicExample}
      shadcnLikeSrc="popover/examples/basic-shadcn-like.tsx"
      shadcnLikeComp={BasicShadcnLikeExample}
    />
  ),
};

export const DefaultSpacing: ExampleStory = {
  render: () => (
    <ComponentSource
      src="popover/examples/default-spacing.tsx"
      __comp__={DefaultSpacingExample}
    />
  ),
};
```

- [ ] **Step 5: Run the existing runtime test file after adding docs examples**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.test.tsx
```

Expected: PASS, confirming the docs/examples work did not change runtime behavior.

- [ ] **Step 6: Commit the new examples and stories**

Run:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/popover/examples/basic.tsx packages/ui/src/components/popover/examples/basic-shadcn-like.tsx packages/ui/src/components/popover/examples/default-spacing.tsx packages/ui/src/components/popover/popover.stories.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "docs: add popover stories and examples"
```

Expected: a commit containing only the new Storybook docs files.

---

### Task 5: Add Storybook structure tests for the compare layout

**Files:**
- Create: `packages/ui/src/components/popover/popover.stories.test.tsx`
- Test: `packages/ui/src/components/popover/popover.stories.test.tsx`

- [ ] **Step 1: Add compare-story structure tests**

Create `packages/ui/src/components/popover/popover.stories.test.tsx` with this exact content:

```tsx
import "@testing-library/jest-dom/vitest";

import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Basic } from "./popover.stories";

vi.mock("../mdx/component-source", () => ({
  ComponentSource: ({ src }: { src: string }) => (
    <div data-slot="code-box-demo">{src}</div>
  ),
}));

describe("Popover stories", () => {
  test("keeps both compare previews mounted in the basic story", () => {
    const rendered = Basic.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(container.querySelectorAll('[data-slot="code-box-demo"]')).toHaveLength(2);
  });

  test("adds the inactive-state hiding class to force-mounted compare panels", () => {
    const rendered = Basic.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);
    const panels = container.querySelectorAll<HTMLElement>('[data-slot="tabs-content"]');

    expect(panels).toHaveLength(2);
    expect(panels[0]).toHaveClass("data-[state=inactive]:hidden");
    expect(panels[1]).toHaveClass("data-[state=inactive]:hidden");
  });

  test("anchors compare tabs to a stable width container", () => {
    const rendered = Basic.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);
    const wrapper = container.firstElementChild;
    const tabsRoot = container.querySelector('[data-slot="tabs"]');

    expect(wrapper).toHaveClass("w-full");
    expect(wrapper).toHaveClass("sm:w-3xl");
    expect(tabsRoot).toHaveClass("w-full");
  });

  test("uses descriptive compare tab labels", () => {
    const rendered = Basic.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(
      container.querySelector('[role="tab"][data-state="active"]')?.textContent,
    ).toContain("Standard API");
    expect(container.textContent).toContain("Composable API");
  });
});
```

- [ ] **Step 2: Run the story structure test**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.stories.test.tsx
```

Expected: PASS, proving the compare layout stays stable.

- [ ] **Step 3: Commit the Storybook structure test**

Run:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/popover/popover.stories.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "test: cover popover story structure"
```

Expected: a commit containing only the Storybook structure test.

---

### Task 6: Final verification and handoff

**Files:**
- Verify: `packages/ui/src/components/popover/_component.tsx`
- Verify: `packages/ui/src/components/popover/popover.tsx`
- Verify: `packages/ui/src/components/popover/popover.test.tsx`
- Verify: `packages/ui/src/components/popover/popover.stories.tsx`
- Verify: `packages/ui/src/components/popover/popover.stories.test.tsx`
- Verify: `packages/ui/src/components/popover/examples/*`
- Verify: `packages/ui/src/components/date-picker/date-picker.tsx`

- [ ] **Step 1: Run the full targeted verification set**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui test -- --runInBand src/components/popover/popover.test.tsx src/components/popover/popover.stories.test.tsx src/components/date-picker/date-picker.test.tsx
```

Expected: PASS for the popover runtime regression, story structure test, and related date-picker tests.

- [ ] **Step 2: Run typecheck for the UI package**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck
```

Expected: PASS with no TypeScript errors introduced by the wrapper fix or Storybook files.

- [ ] **Step 3: Review the final diff for only planned files**

Run:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" diff -- packages/ui/src/components/popover packages/ui/src/components/date-picker/date-picker.tsx
```

Expected: diff contains only the wrapper fix, test updates, new stories/examples, and the `DatePicker` override removal.

- [ ] **Step 4: Commit the verified final state**

Run:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/popover packages/ui/src/components/date-picker/date-picker.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "feat: document popover defaults"
```

Expected: final feature commit after tests and typecheck pass.

---

## Self-review

- **Spec coverage:** The plan includes the wrapper-level spacing fix, removal of `DatePicker`’s manual offset, regression coverage for default spacing, and new Storybook docs/examples for `Popover` in the same compare format used by `Combobox`.
- **Placeholder scan:** Removed vague instructions. Every coding step names exact files, concrete code, exact commands, and expected outcomes.
- **Type consistency:** The plan consistently treats the shadcn baseline as `align = "center"` and `sideOffset = 4`, preserves optional `alignOffset`, and uses the same `Popover`/`PopoverContent` naming as the current codebase.
