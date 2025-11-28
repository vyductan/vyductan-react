import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Send, Trash2 } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

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
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} size="small">
        Small
      </Button>
      <Button {...args} size="middle">
        Middle
      </Button>
      <Button {...args} size="large">
        Large
      </Button>
    </div>
  ),
  args: {
    variant: "solid",
    color: "default",
  },
};

export const WithIcon: Story = {
  args: {
    children: "Add Item",
    icon: <Plus className="size-4" />,
    variant: "solid",
    color: "primary",
  },
};

export const IconOnly: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} icon={<Plus />} aria-label="Add" />
      <Button
        {...args}
        icon={<Trash2 />}
        variant="outlined"
        color="danger"
        aria-label="Delete"
      />
      <Button
        {...args}
        icon={<Send />}
        variant="filled"
        color="blue"
        shape="circle"
        aria-label="Send"
      />
    </div>
  ),
  args: {
    variant: "solid",
    color: "default",
    shape: "icon",
  },
};

export const Loading: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} loading>
        Loading
      </Button>
      <Button {...args} loading icon={<Plus />}>
        Loading with Icon
      </Button>
      <Button
        {...args}
        loading
        shape="circle"
        icon={<Plus />}
        aria-label="Loading"
      />
    </div>
  ),
  args: {
    variant: "solid",
    color: "primary",
  },
};

export const Disabled: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} disabled variant="solid">
        Solid
      </Button>
      <Button {...args} disabled variant="outlined">
        Outlined
      </Button>
      <Button {...args} disabled variant="text">
        Text
      </Button>
    </div>
  ),
  args: {
    children: "Disabled",
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
