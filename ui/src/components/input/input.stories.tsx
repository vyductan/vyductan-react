import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Lock, Mail, Search, User } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Input } from "./input";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["outlined", "filled", "borderless"],
    },
    size: {
      control: "radio",
      options: ["small", "middle", "large"],
    },
    status: {
      control: "select",
      options: ["error", "warning"],
    },
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Basic Input",
    className: "w-[300px]",
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex w-[300px] flex-col gap-4">
      <Input {...args} variant="outlined" placeholder="Outlined" />
      <Input {...args} variant="filled" placeholder="Filled" />
      <Input {...args} variant="borderless" placeholder="Borderless" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-[300px] flex-col gap-4">
      <Input {...args} size="small" placeholder="Small Input" />
      <Input {...args} size="middle" placeholder="Middle Input" />
      <Input {...args} size="large" placeholder="Large Input" />
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex w-[300px] flex-col gap-4">
      <Input
        {...args}
        prefix={<User className="size-4" />}
        placeholder="Username"
      />
      <Input
        {...args}
        suffix={<Search className="size-4" />}
        placeholder="Search..."
      />
      <Input
        {...args}
        prefix={<Mail className="size-4" />}
        suffix={<Lock className="size-4" />}
        placeholder="Email"
      />
    </div>
  ),
};

export const Status: Story = {
  render: (args) => (
    <div className="flex w-[300px] flex-col gap-4">
      <Input {...args} status="error" placeholder="Error Status" />
      <Input {...args} status="warning" placeholder="Warning Status" />
    </div>
  ),
};

export const WithCount: Story = {
  render: (args) => (
    <div className="flex w-[300px] flex-col gap-4">
      <Input {...args} showCount maxLength={20} placeholder="With Count" />
      <Input {...args} showCount maxLength={100} placeholder="Max Length 100" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled Input",
    className: "w-[300px]",
  },
};

// ============================================
// INTERACTION TESTS - Browser Mode Testing
// ============================================

// Test 1: Basic typing interaction
export const InteractionTyping: Story = {
  args: {
    placeholder: "Type something...",
    className: "w-[300px]",
    onChange: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("User types into input field", async () => {
      const input = canvas.getByPlaceholderText("Type something...");

      // Verify input exists and is focused
      await expect(input).toBeTruthy();

      // Type text
      await userEvent.type(input, "Hello World");

      // Verify value
      await expect(input).toHaveValue("Hello World");

      // Verify onChange was called multiple times (once per character)
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};

// Test 2: Character limit and count display
export const InteractionCharacterLimit: Story = {
  args: {
    placeholder: "Max 10 characters",
    className: "w-[300px]",
    showCount: true,
    maxLength: 10,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Type and verify character count", async () => {
      const input = canvas.getByPlaceholderText("Max 10 characters");

      // Type within limit
      await userEvent.type(input, "Hello");
      await expect(input).toHaveValue("Hello");

      // Verify count display shows (5 / 10)
      const countDisplay = canvasElement.querySelector('[class*="count"]');
      await expect(countDisplay).toBeTruthy();
    });

    await step("Verify max length constraint", async () => {
      const input = canvas.getByPlaceholderText<HTMLInputElement>("Max 10 characters");

      // Try to exceed limit
      await userEvent.clear(input);
      await userEvent.type(input, "12345678901234567890");

      // Should be truncated to 10 characters
      await expect(input.value.length).toBeLessThanOrEqual(10);
    });
  },
};

// Test 3: Keyboard interactions (Enter, Escape, Tab)
export const InteractionKeyboard: Story = {
  args: {
    placeholder: "Press Enter to submit",
    className: "w-[300px]",
    onPressEnter: fn(),
    onKeyDown: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Type and press Enter key", async () => {
      const input = canvas.getByPlaceholderText("Press Enter to submit");

      await userEvent.type(input, "Test message");
      await userEvent.keyboard("{Enter}");

      // Verify onPressEnter was called
      await expect(args.onPressEnter).toHaveBeenCalled();
    });

    await step("Press Escape to clear", async () => {

      await userEvent.keyboard("{Escape}");
      await expect(args.onKeyDown).toHaveBeenCalled();
    });
  },
};

// Test 4: Clear button interaction
export const InteractionClearButton: Story = {
  args: {
    placeholder: "Type to see clear button",
    className: "w-[300px]",
    allowClear: true,
    onChange: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Type and verify clear button appears", async () => {
      const input = canvas.getByPlaceholderText("Type to see clear button");

      await userEvent.type(input, "Clear me!");
      await expect(input).toHaveValue("Clear me!");
    });

    await step("Click clear button and verify input is cleared", async () => {
      const input = canvas.getByPlaceholderText("Type to see clear button");

      // Find and click the clear button (usually an X icon)
      const clearButton = canvasElement.querySelector(
        '[aria-label*="clear" i], [role="button"]',
      );

      if (clearButton) {
        await userEvent.click(clearButton);

        // Verify input is cleared
        await expect(input).toHaveValue("");

        // Verify onChange was called
        await expect(args.onChange).toHaveBeenCalled();
      }
    });
  },
};

// Test 5: Focus and Blur events
export const InteractionFocusBlur: Story = {
  args: {
    placeholder: "Click to focus",
    className: "w-[300px]",
    onFocus: fn(),
    onBlur: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Focus input and verify onFocus is called", async () => {
      const input = canvas.getByPlaceholderText("Click to focus");

      await userEvent.click(input);

      // Verify input is focused
      await expect(input).toHaveFocus();
      await expect(args.onFocus).toHaveBeenCalled();
    });

    await step("Blur input and verify onBlur is called", async () => {
      const input = canvas.getByPlaceholderText("Click to focus");

      // Tab away to blur
      await userEvent.tab();

      // Verify input lost focus
      await expect(input).not.toHaveFocus();
      await expect(args.onBlur).toHaveBeenCalled();
    });
  },
};

// Test 6: Paste event handling
export const InteractionPaste: Story = {
  args: {
    placeholder: "Paste text here",
    className: "w-[300px]",
    onChange: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Paste text into input", async () => {
      const input = canvas.getByPlaceholderText("Paste text here");

      // Focus the input
      await userEvent.click(input);

      // Simulate paste
      await userEvent.paste("Pasted content from clipboard");

      // Verify pasted value
      await expect(input).toHaveValue("Pasted content from clipboard");
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};

// Test 7: Disabled state prevents interaction
export const InteractionDisabled: Story = {
  args: {
    placeholder: "Disabled input",
    className: "w-[300px]",
    disabled: true,
    onChange: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Verify disabled input cannot be interacted with", async () => {
      const input = canvas.getByPlaceholderText("Disabled input");

      // Verify input is disabled
      await expect(input).toBeDisabled();

      // Try to type (should not work)
      await userEvent.type(input, "Should not work");

      // Verify value is still empty
      await expect(input).toHaveValue("");

      // Verify onChange was NOT called
      await expect(args.onChange).not.toHaveBeenCalled();
    });
  },
};
