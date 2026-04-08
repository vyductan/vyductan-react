# AlertModal Storybook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a story-centric Storybook file for `AlertModal` and remove `examples/*` indirection from `Button` stories so both components expose their main Storybook surface directly from `.stories.tsx` files.

**Architecture:** Keep the existing component APIs intact and limit changes to Storybook presentation files plus the already-started `AlertModal` regression test. `alert-modal.stories.tsx` becomes the new primary story surface for `AlertModal`, while `button.stories.tsx` is simplified by inlining the visual demo layouts that currently live in `examples/*.tsx`.

**Tech Stack:** React 19, Storybook `@storybook/nextjs-vite`, Storybook interaction testing via `storybook/test`, Vitest storybook project, PNPM workspace scripts.

---

## File map

- **Create:** `packages/ui/src/components/alert-modal/alert-modal.stories.tsx` — primary Storybook stories for `AlertModal`, including one controlled/open story and one lightweight interaction story.
- **Modify:** `packages/ui/src/components/button/button.stories.tsx` — inline the current visual demo stories instead of importing `examples/*.tsx`.
- **Modify:** `packages/ui/src/components/alert-modal/alert-modal.test.tsx` — keep the focused `okType="danger"` regression test passing after the `AlertModal` fix.
- **Reference only:**
  - `packages/ui/src/components/alert-modal/alert-modal.tsx`
  - `packages/ui/src/components/button/examples/sizes.tsx`
  - `packages/ui/src/components/button/examples/with-icon.tsx`
  - `packages/ui/src/components/button/examples/icon.tsx`
  - `packages/ui/src/components/button/examples/loading.tsx`
  - `packages/ui/src/components/button/examples/disabled.tsx`
  - `packages/ui/src/components/alert-modal/examples/basic.tsx`
  - `packages/ui/src/components/alert-modal/examples/types.tsx`

### Task 1: Lock the `AlertModal` danger-button regression

**Files:**
- Modify: `packages/ui/src/components/alert-modal/alert-modal.test.tsx`
- Modify: `packages/ui/src/components/alert-modal/alert-modal.tsx`

- [ ] **Step 1: Write the failing test**

Use this exact test file content so the regression is isolated to the `okType` contract:

```tsx
import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { AlertModal } from "./alert-modal";

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

describe("AlertModal", () => {
  test('applies danger styling to the confirm action when okType="danger"', () => {
    render(
      <AlertModal
        open
        title="Delete item"
        description="This action cannot be undone."
        okText="Delete"
        okType="danger"
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "Delete" });

    expect(confirmButton).toHaveClass("border-red-600");
    expect(confirmButton).toHaveClass("bg-red-600");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `vyductan-react/`:

```bash
pnpm -F @acme/ui test -- src/components/alert-modal/alert-modal.test.tsx
```

Expected: the test runner includes `alert-modal.test.tsx` and the assertion fails because the confirm action still renders with primary styling.

- [ ] **Step 3: Write minimal implementation**

Update the `AlertModal` props destructure and confirm button color fallback in `packages/ui/src/components/alert-modal/alert-modal.tsx` to this shape:

```tsx
export const AlertModal = ({
  className,
  classNames,
  description,
  okText = "Confirm",
  cancelText = "Cancel",
  confirmLoading = false,
  title,
  trigger,
  onConfirm,
  onCancel,
  onOpenChange,
  type = "confirm",
  children,
  okButtonProps,
  media,
  okType,
  ...rest
}: AlertModalProps) => {
```

```tsx
buttonColorVariants({
  variant: okButtonProps?.variant ?? "solid",
  color:
    okButtonProps?.color ??
    (okType === "danger" ? "danger" : "primary"),
})
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm -F @acme/ui test -- src/components/alert-modal/alert-modal.test.tsx
```

Expected: the `AlertModal` test passes and no new failures appear in that targeted run.

- [ ] **Step 5: Commit**

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/alert-modal/alert-modal.tsx packages/ui/src/components/alert-modal/alert-modal.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "$(cat <<'EOF'
fix: respect danger okType in alert modal
EOF
)"
```

### Task 2: Add a story-centric `AlertModal` Storybook file

**Files:**
- Create: `packages/ui/src/components/alert-modal/alert-modal.stories.tsx`
- Reference: `packages/ui/src/components/alert-modal/alert-modal.tsx`

- [ ] **Step 1: Write the failing story file skeleton**

Create `packages/ui/src/components/alert-modal/alert-modal.stories.tsx` with this initial skeleton:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "../button";
import { AlertModal } from "./alert-modal";

const meta = {
  title: "Components/AlertModal",
  component: AlertModal,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
    },
    description: {
      control: "text",
    },
    okText: {
      control: "text",
    },
    cancelText: {
      control: "text",
    },
    type: {
      control: "radio",
      options: ["confirm", "warning", "info", "success", "error"],
    },
    okType: {
      control: "radio",
      options: ["default", "primary", "danger"],
    },
    confirmLoading: {
      control: "boolean",
    },
    open: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof AlertModal>;

export default meta;
type Story = StoryObj<typeof meta>;
```

- [ ] **Step 2: Run Storybook test discovery to verify the file is picked up**

Run:

```bash
pnpm -F @acme/ui test -- src/components/alert-modal/alert-modal.stories.tsx
```

Expected: Storybook/Vitest discovers the new story file. It may fail because no stories are exported yet; that failure confirms the file is wired into discovery.

- [ ] **Step 3: Write the minimal story implementation**

Fill `alert-modal.stories.tsx` with these exact story shapes:

```tsx
const AlertModalStory = (args: React.ComponentProps<typeof AlertModal>) => {
  const [open, setOpen] = React.useState(false);

  return (
    <AlertModal
      {...args}
      open={open}
      onOpenChange={setOpen}
      onConfirm={fn()}
      onCancel={() => setOpen(false)}
      trigger={<Button>{args.okText ? `Open ${args.okText} modal` : "Open modal"}</Button>}
    />
  );
};

const OpenAlertModalStory = (args: React.ComponentProps<typeof AlertModal>) => (
  <div className="w-[420px]">
    <AlertModal {...args} open onOpenChange={fn()} onConfirm={fn()} />
  </div>
);

export const Default: Story = {
  render: (args) => <AlertModalStory {...args} />,
  args: {
    title: "Delete item",
    description: "This action cannot be undone.",
    okText: "Delete",
    cancelText: "Cancel",
    type: "confirm",
  },
};

export const Confirm: Story = {
  render: (args) => <OpenAlertModalStory {...args} />,
  args: {
    title: "Confirm action",
    description: "Please review before continuing.",
    okText: "Confirm",
    cancelText: "Cancel",
    type: "confirm",
  },
};

export const Danger: Story = {
  render: (args) => <OpenAlertModalStory {...args} />,
  args: {
    title: "Delete item",
    description: "This action cannot be undone.",
    okText: "Delete",
    cancelText: "Cancel",
    type: "confirm",
    okType: "danger",
  },
};

export const Warning: Story = {
  render: (args) => <OpenAlertModalStory {...args} />,
  args: {
    title: "Warning",
    description: "This action may have unintended consequences.",
    okText: "I Understand",
    type: "warning",
  },
};

export const Info: Story = {
  render: (args) => <OpenAlertModalStory {...args} />,
  args: {
    title: "Information",
    description: "Here is some important information about this flow.",
    okText: "Got it",
    type: "info",
  },
};

export const Success: Story = {
  render: (args) => <OpenAlertModalStory {...args} />,
  args: {
    title: "Success",
    description: "Your action has been completed successfully.",
    okText: "Continue",
    type: "success",
  },
};

export const Error: Story = {
  render: (args) => <OpenAlertModalStory {...args} />,
  args: {
    title: "Error",
    description: "An error occurred while processing your request.",
    okText: "OK",
    type: "error",
  },
};

export const InteractionConfirm: Story = {
  render: (args) => {
    const onConfirm = fn();

    return (
      <AlertModal
        {...args}
        onConfirm={onConfirm}
        trigger={<Button>Open confirm modal</Button>}
      />
    );
  },
  args: {
    title: "Delete item",
    description: "This action cannot be undone.",
    okText: "Delete",
    cancelText: "Cancel",
    okType: "danger",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("open the dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /open confirm modal/i }),
      );
      await expect(within(document.body).getByText("Delete item")).toBeTruthy();
    });

    await step("verify the confirm action is visible", async () => {
      await expect(
        within(document.body).getByRole("button", { name: /delete/i }),
      ).toBeTruthy();
    });
  },
};
```

- [ ] **Step 4: Run targeted verification for the new story file**

Run:

```bash
pnpm -F @acme/ui test -- src/components/alert-modal/alert-modal.stories.tsx
```

Expected: Storybook discovers the new `AlertModal` stories and the interaction story passes.

- [ ] **Step 5: Commit**

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/alert-modal/alert-modal.stories.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "$(cat <<'EOF'
feat: add alert modal stories
EOF
)"
```

### Task 3: Inline the visual `Button` stories

**Files:**
- Modify: `packages/ui/src/components/button/button.stories.tsx`
- Reference: `packages/ui/src/components/button/examples/sizes.tsx`
- Reference: `packages/ui/src/components/button/examples/with-icon.tsx`
- Reference: `packages/ui/src/components/button/examples/icon.tsx`
- Reference: `packages/ui/src/components/button/examples/loading.tsx`
- Reference: `packages/ui/src/components/button/examples/disabled.tsx`

- [ ] **Step 1: Write the failing cleanup check**

Before editing, confirm the current file still imports the example demos:

```tsx
import DisabledDemo from "./examples/disabled";
import IconDemo from "./examples/icon";
import LoadingDemo from "./examples/loading";
import SizesDemo from "./examples/sizes";
import WithIconDemo from "./examples/with-icon";
```

This is the exact indirection to remove.

- [ ] **Step 2: Run a focused search to verify the old imports exist**

Run:

```bash
python - <<'PY'
from pathlib import Path
path = Path('/Users/vyductan/Developer/vyductan/vyductan-react/packages/ui/src/components/button/button.stories.tsx')
for index, line in enumerate(path.read_text().splitlines(), start=1):
    if './examples/' in line:
        print(f"{index}:{line}")
PY
```

Expected: five import lines for the current example demos.

- [ ] **Step 3: Write the minimal inline story implementation**

Replace the demo imports with inline JSX and icon imports. At the top of `button.stories.tsx`, keep the existing Storybook imports and add:

```tsx
import { ArrowUpRight, Download, Mail, Plus, Trash2 } from "lucide-react";

import { Flex } from "../flex";
import { Button } from "./button";
```

Remove these imports completely:

```tsx
import DisabledDemo from "./examples/disabled";
import IconDemo from "./examples/icon";
import LoadingDemo from "./examples/loading";
import SizesDemo from "./examples/sizes";
import WithIconDemo from "./examples/with-icon";
```

Replace the five story renders with these inline versions:

```tsx
export const Sizes: Story = {
  render: () => (
    <Flex gap="small" align="center" wrap>
      <Button type="primary" size="small">
        Small
      </Button>
      <Button type="primary" size="middle">
        Default
      </Button>
      <Button type="primary" size="large">
        Large
      </Button>
    </Flex>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Flex gap="small" align="center" wrap>
      <Button type="primary">
        <Plus className="size-4" />
        Add Item
      </Button>
      <Button>
        <Download className="size-4" />
        Download
      </Button>
      <Button type="link">
        <Mail className="size-4" />
        Send Email
      </Button>
    </Flex>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Flex gap="small" align="center" wrap>
      <Button shape="icon" size="small" aria-label="Add item">
        <Plus className="size-4" />
      </Button>
      <Button shape="icon" aria-label="Open link">
        <ArrowUpRight className="size-4" />
      </Button>
      <Button type="primary" shape="icon" size="large" aria-label="Delete item">
        <Trash2 className="size-4" />
      </Button>
    </Flex>
  ),
};

export const Loading: Story = {
  render: () => (
    <Flex gap="small" wrap>
      <Button type="primary" loading>
        Loading
      </Button>
      <Button loading>Loading default</Button>
    </Flex>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Flex gap="small" align="flex-start" vertical>
      <Flex gap="small">
        <Button type="primary">Primary</Button>
        <Button type="primary" disabled>
          Primary(disabled)
        </Button>
      </Flex>
      <Flex gap="small">
        <Button>Default</Button>
        <Button disabled>Default(disabled)</Button>
      </Flex>
      <Flex gap="small">
        <Button type="dashed">Dashed</Button>
        <Button type="dashed" disabled>
          Dashed(disabled)
        </Button>
      </Flex>
      <Flex gap="small">
        <Button type="text">Text</Button>
        <Button type="text" disabled>
          Text(disabled)
        </Button>
      </Flex>
      <Flex gap="small">
        <Button type="link">Link</Button>
        <Button type="link" disabled>
          Link(disabled)
        </Button>
      </Flex>
      <Flex gap="small">
        <Button danger>Danger Default</Button>
        <Button danger disabled>
          Danger Default(disabled)
        </Button>
      </Flex>
      <Flex gap="small">
        <Button danger type="text">
          Danger Text
        </Button>
        <Button danger type="text" disabled>
          Danger Text(disabled)
        </Button>
      </Flex>
      <Flex gap="small">
        <Button type="link" danger>
          Danger Link
        </Button>
        <Button type="link" danger disabled>
          Danger Link(disabled)
        </Button>
      </Flex>
    </Flex>
  ),
};
```

- [ ] **Step 4: Run targeted verification for the updated button stories**

Run:

```bash
pnpm -F @acme/ui test -- src/components/button/button.stories.tsx
```

Expected: the button stories still pass, including the existing interaction stories.

- [ ] **Step 5: Commit**

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/button/button.stories.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "$(cat <<'EOF'
refactor: inline button story demos
EOF
)"
```

### Task 4: Run final targeted verification

**Files:**
- Modify: none
- Test: `packages/ui/src/components/alert-modal/alert-modal.test.tsx`
- Test: `packages/ui/src/components/alert-modal/alert-modal.stories.tsx`
- Test: `packages/ui/src/components/button/button.stories.tsx`

- [ ] **Step 1: Run the focused regression test**

Run:

```bash
pnpm -F @acme/ui test -- src/components/alert-modal/alert-modal.test.tsx
```

Expected: PASS for the `okType="danger"` regression.

- [ ] **Step 2: Run the focused `AlertModal` story verification**

Run:

```bash
pnpm -F @acme/ui test -- src/components/alert-modal/alert-modal.stories.tsx
```

Expected: PASS for the `AlertModal` stories, including the interaction story.

- [ ] **Step 3: Run the focused `Button` story verification**

Run:

```bash
pnpm -F @acme/ui test -- src/components/button/button.stories.tsx
```

Expected: PASS for the button stories and interaction tests.

- [ ] **Step 4: Run one combined targeted verification command**

Run:

```bash
pnpm -F @acme/ui test -- src/components/alert-modal/alert-modal.test.tsx src/components/alert-modal/alert-modal.stories.tsx src/components/button/button.stories.tsx
```

Expected: all three targeted surfaces pass together.

- [ ] **Step 5: Commit**

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/alert-modal/alert-modal.test.tsx packages/ui/src/components/alert-modal/alert-modal.stories.tsx packages/ui/src/components/button/button.stories.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "$(cat <<'EOF'
feat: streamline alert modal and button stories
EOF
)"
```
