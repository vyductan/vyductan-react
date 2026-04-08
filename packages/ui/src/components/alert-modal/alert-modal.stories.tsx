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
  },
} satisfies Meta<typeof AlertModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const AlertModalStory = (args: React.ComponentProps<typeof AlertModal>) => {
  const [open, setOpen] = React.useState(false);

  return (
    <AlertModal
      {...args}
      open={open}
      onOpenChange={setOpen}
      onConfirm={fn()}
      onCancel={() => setOpen(false)}
      trigger={
        <Button>{args.okText ? `Open ${args.okText} modal` : "Open modal"}</Button>
      }
    />
  );
};

const OpenAlertModalStory = (
  args: React.ComponentProps<typeof AlertModal>,
) => (
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

    await step("verify the confirm action is danger styled", async () => {
      const confirmButton = within(document.body).getByRole("button", {
        name: /delete/i,
      });

      await expect(confirmButton).toHaveClass("border-red-600");
      await expect(confirmButton).toHaveClass("bg-red-600");
    });
  },
};
