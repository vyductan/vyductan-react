# Colorful Tag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `@acme/ui` `Tag` to support Tailwind-family colorful variants (`filled`, `solid`, `outlined`), preserve the legacy API, and add a reusable `Colorful Tag` example wired into Storybook.

**Architecture:** Keep `src/shadcn/badge.tsx` upstream-like and put all new behavior in the local `Tag` layer. Add the new variant/color unions in the config-provider types, implement colorful named/hex styling inside `tag.tsx`, then create an examples-first Storybook entry that renders through `ComponentSource` and guard that wiring with a focused story-structure test.

**Tech Stack:** React 19, TypeScript, Storybook 10, Vitest, Testing Library, tailwind-variants, Tailwind CSS

---

## File Structure

- **Create:** `packages/ui/src/components/tag/tag.test.tsx`
  - Focused runtime coverage for colorful variants, hex styling, and `ConfigProvider` integration.
- **Create:** `packages/ui/src/components/tag/examples/colorful.tsx`
  - Reusable example component that renders preset Tailwind color families and custom hex colors across `filled`, `solid`, and `outlined` variants.
- **Create:** `packages/ui/src/components/tag/tag.stories.tsx`
  - Storybook entry for `Tag`, including a docs-friendly `Colorful` story rendered through `ComponentSource`.
- **Create:** `packages/ui/src/components/tag/tag.story-structure.test.ts`
  - String-based Storybook wiring guard that ensures the story continues to reuse the shared example component.
- **Modify:** `packages/ui/src/components/tag/tag.tsx`
  - Extend the `Tag` runtime with colorful Tailwind family class maps, hex style helpers, and compatibility-preserving variant resolution.
- **Modify:** `packages/ui/src/components/config-provider/context.ts`
  - Expand `TagConfig` unions so `ConfigProvider` accepts the new `Tag` variants/colors.

## Task 1: Extend `Tag` runtime and config types with TDD

**Files:**
- Create: `packages/ui/src/components/tag/tag.test.tsx`
- Modify: `packages/ui/src/components/tag/tag.tsx`
- Modify: `packages/ui/src/components/config-provider/context.ts`
- Test: `packages/ui/src/components/tag/tag.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/components/tag/tag.test.tsx` with this content:

```tsx
import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { ConfigProvider } from "../config-provider";
import { Tag } from "./tag";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

function getRenderedTag(text: string): HTMLElement {
  const element = screen.getByText(text).closest('[data-slot="tag"]');
  expect(element).not.toBeNull();
  return element as HTMLElement;
}

describe("Tag", () => {
  test("renders filled colorful tags using Tailwind family classes", () => {
    render(
      <Tag variant={"filled" as never} color={"blue" as never}>
        Blue filled
      </Tag>,
    );

    expect(getRenderedTag("Blue filled")).toHaveClass(
      "bg-blue-100",
      "text-blue-700",
      "border-blue-200",
    );
  });

  test("renders solid colorful tags with a strong background and white text", () => {
    render(
      <Tag variant="solid" color={"purple" as never}>
        Purple solid
      </Tag>,
    );

    expect(getRenderedTag("Purple solid")).toHaveClass(
      "bg-purple-600",
      "text-white",
      "border-purple-600",
    );
  });

  test("renders outlined colorful tags with a subtle background and colored border", () => {
    render(
      <Tag variant={"outlined" as never} color={"lime" as never}>
        Lime outlined
      </Tag>,
    );

    expect(getRenderedTag("Lime outlined")).toHaveClass(
      "bg-lime-50",
      "text-lime-700",
      "border-lime-300",
    );
  });

  test("preserves legacy outline styling for existing consumers", () => {
    render(
      <Tag variant="outline" color="default">
        Legacy outline
      </Tag>,
    );

    expect(getRenderedTag("Legacy outline")).toHaveClass(
      "text-foreground",
    );
  });

  test("supports custom hex colors for colorful variants", () => {
    const { rerender } = render(
      <Tag variant="solid" color="#108ee9">
        Solid hex
      </Tag>,
    );

    const solidTag = getRenderedTag("Solid hex");
    expect(solidTag).toHaveClass("text-white");
    expect(solidTag).toHaveStyle({
      backgroundColor: "#108ee9",
      borderColor: "#108ee9",
    });

    rerender(
      <Tag variant={"filled" as never} color="#108ee9">
        Filled hex
      </Tag>,
    );

    const filledTag = getRenderedTag("Filled hex");
    expect(filledTag.getAttribute("style")).toContain(
      "background-color: color-mix(in srgb, #108ee9 18%, white)",
    );
    expect(filledTag.getAttribute("style")).toContain(
      "border-color: color-mix(in srgb, #108ee9 32%, white)",
    );
    expect(filledTag.getAttribute("style")).toContain(
      "color: color-mix(in srgb, #108ee9 72%, black)",
    );

    rerender(
      <Tag variant={"outlined" as never} color="#108ee9">
        Outlined hex
      </Tag>,
    );

    const outlinedTag = getRenderedTag("Outlined hex");
    expect(outlinedTag.getAttribute("style")).toContain(
      "background-color: color-mix(in srgb, #108ee9 8%, white)",
    );
    expect(outlinedTag.getAttribute("style")).toContain(
      "border-color: #108ee9",
    );
    expect(outlinedTag.getAttribute("style")).toContain(
      "color: color-mix(in srgb, #108ee9 72%, black)",
    );
  });

  test("reads colorful defaults from ConfigProvider tag config", () => {
    render(
      <ConfigProvider
        tag={{
          variant: "filled" as never,
          color: "lime" as never,
        }}
      >
        <Tag>Scoped lime</Tag>
      </ConfigProvider>,
    );

    expect(getRenderedTag("Scoped lime")).toHaveClass(
      "bg-lime-100",
      "text-lime-700",
      "border-lime-200",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project storybook src/components/tag/tag.test.tsx
```

Expected: FAIL because `Tag` does not yet map `filled` / `outlined` / `lime` / colorful hex styling to the asserted classes and styles.

- [ ] **Step 3: Write minimal implementation**

First, update the `Tag` config unions in `packages/ui/src/components/config-provider/context.ts`.

Replace the existing `TagVariantConfig` / `TagColorConfig` definitions with:

```ts
type TagVariantConfig =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "filled"
  | "solid"
  | "outlined";
type TagColorConfig =
  | "default"
  | "primary"
  | "success"
  | "processing"
  | "error"
  | "warning"
  | "orange"
  | "gray"
  | "yellow"
  | "amber"
  | "lime"
  | "blue"
  | "indigo"
  | "fuchsia"
  | "green"
  | "cyan"
  | "red"
  | "rose"
  | "pink"
  | "purple"
  | "teal"
  | "green-solid";
```

Then update `packages/ui/src/components/tag/tag.tsx` so the new colorful logic lives alongside the legacy behavior.

Use this implementation shape:

```tsx
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import { tv } from "tailwind-variants";

import { Icon } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";
import { Badge } from "@acme/ui/shadcn/badge";

import type { BadgeProps } from "../badge";
import { useComponentConfig } from "../config-provider";

const color: Record<string, string> = {
  default: "bg-gray-100 text-foreground border-gray-300",
  primary: "bg-primary-300 text-primary-700 border-primary-300",
  success: "bg-green-100 text-green-700 border-green-300",
  processing: "bg-blue-100 text-blue-700 border-blue-300",
  error: "bg-red-100 text-red-700 border-red-300",
  warning: "bg-amber-100 text-amber-700 border-amber-300",
  orange: "bg-orange-100 text-orange-700 border-orange-300",
  gray: "bg-gray-100 text-gray-600 border-gray-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  amber: "bg-amber-100 text-amber-700 border-amber-300",
  lime: "bg-lime-100 text-lime-700 border-lime-300",
  blue: "bg-blue-100 text-blue-700 border-blue-300",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
  fuchsia: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
  green: "bg-green-100 text-green-700 border-green-300",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-300",
  red: "bg-red-100 text-red-700 border-red-300",
  rose: "bg-rose-100 text-rose-700 border-rose-300",
  pink: "bg-pink-100 text-pink-700 border-pink-300",
  purple: "bg-purple-100 text-purple-700 border-purple-300",
  teal: "bg-teal-100 text-teal-700 border-teal-300",
  "green-solid": "bg-green-600 text-white",
};

const colorBordered: Record<string, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-300",
  primary: "bg-primary-200 text-primary-900 border-primary-600",
  success: "bg-success-muted text-success border-green-600",
  processing: "bg-blue-200 text-blue-900 border-blue-600",
  error: "bg-red-200 text-red-900 border-red-600",
  warning: "bg-amber-200 text-amber-900 border-amber-600",
  gray: "bg-gray-200 text-gray-950 border-gray-600",
  amber: "bg-amber-200 text-amber-900 border-amber-600",
  lime: "bg-lime-200 text-lime-900 border-lime-600",
  blue: "bg-blue-200 text-blue-900 border-blue-600",
  indigo: "bg-indigo-200 text-indigo-900 border-indigo-600",
  orange: "bg-orange-200 text-orange-900 border-orange-600",
  fuchsia: "bg-fuchsia-200 text-fuchsia-800 border-fuchsia-600",
  green: "bg-green-200 text-green-900 border-green-600",
  red: "bg-red-200 text-red-900 border-red-600",
  rose: "bg-rose-100 text-rose-600 border-rose-400",
  pink: "bg-pink-300 text-pink-900 border-pink-600",
  purple: "bg-purple-200 text-purple-900 border-purple-600",
  teal: "bg-teal-300 text-teal-900 border-teal-600",
};

const colorfulVariants = ["filled", "solid", "outlined"] as const;
type ColorfulVariant = (typeof colorfulVariants)[number];

const colorfulColorMap = {
  filled: {
    red: "bg-red-100 text-red-700 border-red-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    lime: "bg-lime-100 text-lime-700 border-lime-200",
    green: "bg-green-100 text-green-700 border-green-200",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
  },
  solid: {
    red: "bg-red-600 text-white border-red-600",
    orange: "bg-orange-600 text-white border-orange-600",
    amber: "bg-amber-600 text-white border-amber-600",
    lime: "bg-lime-600 text-white border-lime-600",
    green: "bg-green-600 text-white border-green-600",
    cyan: "bg-cyan-600 text-white border-cyan-600",
    blue: "bg-blue-600 text-white border-blue-600",
    indigo: "bg-indigo-600 text-white border-indigo-600",
    purple: "bg-purple-600 text-white border-purple-600",
    pink: "bg-pink-600 text-white border-pink-600",
    rose: "bg-rose-600 text-white border-rose-600",
  },
  outlined: {
    red: "bg-red-50 text-red-700 border-red-300",
    orange: "bg-orange-50 text-orange-700 border-orange-300",
    amber: "bg-amber-50 text-amber-700 border-amber-300",
    lime: "bg-lime-50 text-lime-700 border-lime-300",
    green: "bg-green-50 text-green-700 border-green-300",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-300",
    blue: "bg-blue-50 text-blue-700 border-blue-300",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-300",
    purple: "bg-purple-50 text-purple-700 border-purple-300",
    pink: "bg-pink-50 text-pink-700 border-pink-300",
    rose: "bg-rose-50 text-rose-700 border-rose-300",
  },
} as const;

const tagVariants = tv({
  base: [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border font-medium whitespace-nowrap transition-[color,box-shadow]",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ],
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent",
      secondary:
        "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
      destructive:
        "bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 text-white",
      outline:
        "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      filled: "",
      solid: "",
      outlined: "",
    },
    color,
    bordered: {
      true: "",
      false: "border-transparent",
    },
    size: {
      default: "px-[7px] py-0.5 text-xs",
      small: "px-1.5 py-0.5 text-[10px]",
      large: "px-2.5 py-1 text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
    bordered: true,
    size: "default",
  },
  compoundVariants: [
    {
      bordered: true,
      color: "default",
      className: colorBordered.default,
    },
    {
      bordered: true,
      color: "primary",
      className: colorBordered.primary,
    },
  ],
});

type TagProps = BadgeProps &
  VariantProps<typeof tagVariants> & {
    icon?: React.ReactNode;
    closeIcon?: React.ReactNode;
    onClose?: () => void;
  };

function isColorfulVariant(
  variant: TagProps["variant"],
): variant is ColorfulVariant {
  return colorfulVariants.includes(variant as ColorfulVariant);
}

function getColorfulClassName(
  variant: TagProps["variant"],
  colorName: TagProps["color"],
): string | undefined {
  if (!isColorfulVariant(variant) || typeof colorName !== "string") {
    return undefined;
  }

  const palette = colorfulColorMap[variant];
  return palette[colorName as keyof typeof palette];
}

function getHexColorStyle(
  variant: TagProps["variant"],
  colorName: string,
): React.CSSProperties {
  if (variant === "solid") {
    return {
      backgroundColor: colorName,
      borderColor: colorName,
    };
  }

  if (variant === "filled") {
    return {
      backgroundColor: `color-mix(in srgb, ${colorName} 18%, white)`,
      borderColor: `color-mix(in srgb, ${colorName} 32%, white)`,
      color: `color-mix(in srgb, ${colorName} 72%, black)`,
    };
  }

  if (variant === "outlined") {
    return {
      backgroundColor: `color-mix(in srgb, ${colorName} 8%, white)`,
      borderColor: colorName,
      color: `color-mix(in srgb, ${colorName} 72%, black)`,
    };
  }

  return {
    backgroundColor: colorName,
    borderColor: colorName,
  };
}

const Tag = ({
  className,
  variant,
  color,
  bordered: borderedProp,
  icon,
  closeIcon,
  onClose,
  ...props
}: TagProps) => {
  const tagConfig = useComponentConfig("tag");
  const bordered = borderedProp ?? tagConfig.bordered;
  const finalVariant = variant ?? tagConfig.variant;
  const finalColor = color ?? tagConfig.color;
  const finalSize = props.size ?? tagConfig.size;

  const isHexColor =
    typeof finalColor === "string" && finalColor.startsWith("#");
  const colorfulClassName = getColorfulClassName(finalVariant, finalColor);
  const shouldUseLegacyColorVariant =
    !isHexColor && colorfulClassName === undefined;
  const resolvedBordered = shouldUseLegacyColorVariant ? bordered : true;

  return (
    <Badge
      data-slot="tag"
      className={cn(
        tagVariants({
          variant: finalVariant,
          color: shouldUseLegacyColorVariant ? finalColor : undefined,
          bordered: resolvedBordered,
          size: finalSize,
        }),
        colorfulClassName,
        closeIcon && "pr-1",
        isHexColor && finalVariant === "solid" && "text-white",
        tagConfig.className,
        className,
      )}
      style={
        isHexColor && typeof finalColor === "string"
          ? getHexColorStyle(finalVariant, finalColor)
          : undefined
      }
      {...props}
    >
      {icon}
      {props.children}
      {(typeof closeIcon === "boolean" && closeIcon) || onClose ? (
        <Icon
          aria-label="Close"
          icon="icon-[lucide--x]"
          className="size-3 cursor-pointer opacity-50 transition-opacity hover:opacity-100"
          tabIndex={-1}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
            onClose?.();
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        />
      ) : (
        closeIcon
      )}
    </Badge>
  );
};

export { Tag, tagVariants, color as tagColors };
export type { TagProps };
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project storybook src/components/tag/tag.test.tsx
```

Expected: PASS with all six `Tag` tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/config-provider/context.ts packages/ui/src/components/tag/tag.tsx packages/ui/src/components/tag/tag.test.tsx
git commit -m "feat(ui): add colorful tag variants"
```

## Task 2: Add the reusable `Colorful Tag` example and Storybook wiring with TDD

**Files:**
- Create: `packages/ui/src/components/tag/examples/colorful.tsx`
- Create: `packages/ui/src/components/tag/tag.stories.tsx`
- Create: `packages/ui/src/components/tag/tag.story-structure.test.ts`
- Test: `packages/ui/src/components/tag/tag.story-structure.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/components/tag/tag.story-structure.test.ts` with this content:

```ts
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

test("tag stories wire the Colorful example through ComponentSource", () => {
  const storiesFilePath = path.resolve(import.meta.dirname, "./tag.stories.tsx");
  const exampleFilePath = path.resolve(
    import.meta.dirname,
    "./examples/colorful.tsx",
  );

  expect(existsSync(storiesFilePath)).toBe(true);
  expect(existsSync(exampleFilePath)).toBe(true);

  if (!existsSync(storiesFilePath)) {
    return;
  }

  const storiesSource = readFileSync(storiesFilePath, "utf8");

  expect(storiesSource).toContain(
    'import ColorfulExample from "./examples/colorful";',
  );
  expect(storiesSource).toContain("export const Colorful: Story = {");
  expect(storiesSource).toContain(
    '<ComponentSource src="tag/examples/colorful.tsx" __comp__={ColorfulExample} />',
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project storybook src/components/tag/tag.story-structure.test.ts
```

Expected: FAIL because `tag.stories.tsx` and `examples/colorful.tsx` do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `packages/ui/src/components/tag/examples/colorful.tsx`:

```tsx
import { Divider } from "@acme/ui/components/divider";
import { Flex } from "@acme/ui/components/flex";
import { Tag } from "@acme/ui/components/tag";

const variants = ["filled", "solid", "outlined"] as const;
const presets = [
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "cyan",
  "blue",
  "indigo",
  "purple",
  "pink",
  "rose",
] as const;
const customColors = ["#f50", "#2db7f5", "#87d068", "#108ee9"] as const;

export default function ColorfulTagExample() {
  return (
    <div className="w-full max-w-5xl space-y-8">
      {variants.map((variant) => (
        <div key={`presets-${variant}`} className="space-y-3">
          <Divider orientation="start">Presets ({variant})</Divider>
          <Flex gap={8} align="center" wrap>
            {presets.map((color) => (
              <Tag key={`${variant}-${color}`} color={color} variant={variant}>
                {color}
              </Tag>
            ))}
          </Flex>
        </div>
      ))}

      {variants.map((variant) => (
        <div key={`custom-${variant}`} className="space-y-3">
          <Divider orientation="start">Custom ({variant})</Divider>
          <Flex gap={8} align="center" wrap>
            {customColors.map((color) => (
              <Tag key={`${variant}-${color}`} color={color} variant={variant}>
                {color}
              </Tag>
            ))}
          </Flex>
        </div>
      ))}
    </div>
  );
}
```

Create `packages/ui/src/components/tag/tag.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ComponentSource } from "../mdx/component-source";
import ColorfulExample from "./examples/colorful";
import { Tag } from "./tag";

const meta = {
  title: "Components/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "filled",
        "solid",
        "outlined",
      ],
    },
    color: {
      control: "select",
      options: [
        "default",
        "primary",
        "success",
        "processing",
        "error",
        "warning",
        "orange",
        "gray",
        "yellow",
        "amber",
        "lime",
        "green",
        "cyan",
        "blue",
        "indigo",
        "fuchsia",
        "red",
        "rose",
        "pink",
        "purple",
        "teal",
      ],
    },
    bordered: {
      control: "boolean",
    },
    size: {
      control: "radio",
      options: ["small", "default", "large"],
    },
    closeIcon: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Tag",
    color: "default",
  },
};

export const Colorful: Story = {
  render: () => (
    <ComponentSource src="tag/examples/colorful.tsx" __comp__={ColorfulExample} />
  ),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project storybook src/components/tag/tag.story-structure.test.ts
```

Expected: PASS with the new story wiring verified.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/tag/examples/colorful.tsx packages/ui/src/components/tag/tag.stories.tsx packages/ui/src/components/tag/tag.story-structure.test.ts
git commit -m "feat(ui): add colorful tag storybook example"
```

## Task 3: Run focused regression checks and verify the Storybook experience

**Files:**
- Test: `packages/ui/src/components/tag/tag.test.tsx`
- Test: `packages/ui/src/components/tag/tag.story-structure.test.ts`
- Verify: `packages/ui/src/components/tag/tag.stories.tsx`
- Verify: `packages/ui/src/components/tag/examples/colorful.tsx`

- [ ] **Step 1: Run the focused regression suite**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project storybook src/components/tag/tag.test.tsx src/components/tag/tag.story-structure.test.ts
```

Expected: PASS with both the runtime behavior tests and the Storybook wiring test green.

- [ ] **Step 2: Start Storybook for manual verification**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui storybook
```

Expected: Storybook starts on port `6006`.

- [ ] **Step 3: Verify the `Tag` stories in the browser**

Open Storybook and confirm all of the following:

```text
1. The sidebar contains Components/Tag.
2. The Default story renders a plain Tag using the local component.
3. The Colorful story renders through ComponentSource with code + preview.
4. The preview shows six labeled groups:
   - Presets (filled)
   - Presets (solid)
   - Presets (outlined)
   - Custom (filled)
   - Custom (solid)
   - Custom (outlined)
5. Preset Tailwind families visibly change color across the three variants.
6. Custom hex tags remain readable in all three variants.
```

- [ ] **Step 4: If the manual check surfaced visual issues, make the smallest fix and rerun the focused suite**

Use the same commands again after the fix:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project storybook src/components/tag/tag.test.tsx src/components/tag/tag.story-structure.test.ts
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui storybook
```

Expected: tests stay green and the `Components/Tag` Storybook view looks correct after the polish.

## Self-Review

- **Spec coverage:**
  - New colorful Tailwind-family variants → Task 1
  - Hex color handling → Task 1
  - `ConfigProvider` support → Task 1
  - Reusable example under `examples/` → Task 2
  - Storybook wiring → Task 2
  - Manual Storybook verification → Task 3
- **Placeholder scan:** No `TODO`, `TBD`, “similar to above”, or unspecified test steps remain.
- **Type consistency:** `filled`, `solid`, `outlined`, and `lime` are used consistently across the config types, runtime code, example, story, and tests.
