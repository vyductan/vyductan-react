import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox } from "lucide-react";
import { expect, within } from "storybook/test";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from ".";

const SIZES = ["default", "sm", "xs"] as const;

const meta = {
  title: "Components/Item",
  component: Item,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "select",
      options: SIZES,
    },
    variant: {
      control: "select",
      options: ["default", "outline", "muted"],
    },
  },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "outline",
  },
  render: (args) => (
    <Item {...args} className="w-80">
      <ItemMedia variant="icon">
        <Inbox />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Inbox</ItemTitle>
        <ItemDescription>You have 3 unread messages.</ItemDescription>
      </ItemContent>
    </Item>
  ),
};

/**
 * `xs` is not in the shadcn registry we install from — it lives in the wrapper
 * (see `components/item/index.tsx`), so it is worth seeing next to the sizes
 * that come straight from `shadcn/item.tsx`.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      {SIZES.map((size) => (
        <Item key={size} size={size} variant="outline" data-testid={size}>
          <ItemMedia variant="icon">
            <Inbox />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>size=&quot;{size}&quot;</ItemTitle>
            <ItemDescription>
              Description text, smaller at the xs size.
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const padding = (size: (typeof SIZES)[number]) => {
      const item = canvas.getByTestId(size);
      const style = globalThis.getComputedStyle(item);
      return {
        item,
        x: Number.parseFloat(style.paddingLeft),
        y: Number.parseFloat(style.paddingTop),
      };
    };

    await step("each size reaches the DOM as data-size", async () => {
      for (const size of SIZES) {
        await expect(canvas.getByTestId(size)).toHaveAttribute(
          "data-size",
          size,
        );
      }
    });

    await step("xs is the tightest of the three", async () => {
      const [big, small, extraSmall] = SIZES.map((size) => padding(size));

      // xs must not inherit the default size's p-4 — the whole point of
      // passing `size={null}` down to the shadcn cva.
      await expect(extraSmall!.y).toBeLessThan(small!.y);
      await expect(small!.y).toBeLessThan(big!.y);
      await expect(extraSmall!.x).toBeLessThan(small!.x);
    });

    await step("xs shrinks the description", async () => {
      const descriptionSize = (size: (typeof SIZES)[number]) =>
        Number.parseFloat(
          globalThis.getComputedStyle(
            within(canvas.getByTestId(size)).getByText(/Description text/),
          ).fontSize,
        );

      await expect(descriptionSize("xs")).toBeLessThan(
        descriptionSize("default"),
      );
    });
  },
};
