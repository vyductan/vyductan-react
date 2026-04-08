import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowUpRight, Download, Mail, Plus, Trash2 } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Flex } from "../flex";
import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outlined", "dashed", "filled", "link", "text"],
    },
    color: {
      control: "select",
      options: [
        "default",
        "primary",
        "danger",
        "success",
        "blue",
        "green",
        "orange",
        "red",
        "gray",
      ],
    },
    size: {
      control: "radio",
      options: ["small", "middle", "large"],
    },
    shape: {
      control: "radio",
      options: ["default", "circle", "icon"],
    },
    loading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    danger: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "solid",
    color: "default",
  },
};

export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "solid",
    color: "primary",
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} variant="solid">
        Solid
      </Button>
      <Button {...args} variant="outlined">
        Outlined
      </Button>
      <Button {...args} variant="dashed">
        Dashed
      </Button>
      <Button {...args} variant="filled">
        Filled
      </Button>
      <Button {...args} variant="text">
        Text
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
  args: {
    color: "primary",
  },
};

export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Button {...args} color="default">
          Default
        </Button>
        <Button {...args} color="primary">
          Primary
        </Button>
        <Button {...args} color="danger">
          Danger
        </Button>
        <Button {...args} color="success">
          Success
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button {...args} color="blue">
          Blue
        </Button>
        <Button {...args} color="green">
          Green
        </Button>
        <Button {...args} color="orange">
          Orange
        </Button>
        <Button {...args} color="red">
          Red
        </Button>
        <Button {...args} color="gray">
          Gray
        </Button>
      </div>
    </div>
  ),
  args: {
    variant: "solid",
  },
};

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
        <Button type="primary" href="https://ant.design/index-cn">
          Href Primary
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

export const WithError: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} aria-invalid variant="solid">
        Solid
      </Button>
      <Button {...args} aria-invalid variant="outlined">
        Outlined
      </Button>
      <Button {...args} aria-invalid variant="text">
        Text
      </Button>
    </div>
  ),
  args: {
    children: "Error",
    color: "primary",
  },
};

// Interaction Testing - Test button click behavior
export const InteractionTest: Story = {
  args: {
    children: "Click Me",
    variant: "solid",
    color: "primary",
    onClick: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Click button and verify onClick is called", async () => {
      // Find the button by its text
      const button = canvas.getByRole("button", { name: /click me/i });

      // Verify button is in the document and visible
      await expect(button).toBeTruthy();
      await expect(button).toBeVisible();

      // Click the button
      await userEvent.click(button);

      // Assert that onClick was called
      await expect(args.onClick).toHaveBeenCalled();
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};

// Interaction Testing - Test disabled button behavior
export const InteractionDisabled: Story = {
  args: {
    children: "Disabled Button",
    variant: "solid",
    color: "primary",
    disabled: true,
    onClick: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Verify disabled button cannot be clicked", async () => {
      const button = canvas.getByRole("button", { name: /disabled button/i });

      // Verify button is disabled
      await expect(button).toBeDisabled();

      // Try to click (should not trigger onClick)
      await userEvent.click(button);

      // Assert that onClick was NOT called
      await expect(args.onClick).not.toHaveBeenCalled();
    });
  },
};

// Interaction Testing - Test button with icon
export const InteractionWithIcon: Story = {
  args: {
    children: "Add Item",
    icon: <Plus className="size-4" />,
    variant: "solid",
    color: "primary",
    onClick: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Click button with icon", async () => {
      const button = canvas.getByRole("button", { name: /add item/i });

      await expect(button).toBeTruthy();

      // Click the button
      await userEvent.click(button);

      // Verify onClick was called
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};
