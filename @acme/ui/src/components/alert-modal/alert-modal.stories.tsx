import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "../button";
import { AlertModal } from "./alert-modal";
import WithTextareaDemo from "./examples/with-textarea";

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

const AlertModalStory = (
  arguments_: React.ComponentProps<typeof AlertModal>,
) => {
  const [open, setOpen] = React.useState(false);

  return (
    <AlertModal
      {...arguments_}
      open={open}
      onOpenChange={setOpen}
      onConfirm={fn()}
      onCancel={() => setOpen(false)}
      trigger={
        <Button>
          {arguments_.okText ? `Open ${arguments_.okText} modal` : "Open modal"}
        </Button>
      }
    />
  );
};

const OpenAlertModalStory = (
  arguments_: React.ComponentProps<typeof AlertModal>,
) => (
  <div className="w-[420px]">
    <AlertModal {...arguments_} open onOpenChange={fn()} onConfirm={fn()} />
  </div>
);

export const Default: Story = {
  render: (arguments_) => <AlertModalStory {...arguments_} />,
  args: {
    title: "Delete item",
    description: "This action cannot be undone.",
    okText: "Delete",
    cancelText: "Cancel",
    type: "confirm",
  },
};

export const Confirm: Story = {
  render: (arguments_) => <OpenAlertModalStory {...arguments_} />,
  args: {
    title: "Confirm action",
    description: "Please review before continuing.",
    okText: "Confirm",
    cancelText: "Cancel",
    type: "confirm",
  },
};

export const Warning: Story = {
  render: (arguments_) => <OpenAlertModalStory {...arguments_} />,
  args: {
    title: "Unsaved changes",
    description: "You have unsaved changes. Leaving now will discard them.",
    okText: "Leave anyway",
    cancelText: "Keep editing",
    type: "warning",
  },
};

export const Info: Story = {
  render: (arguments_) => <OpenAlertModalStory {...arguments_} />,
  args: {
    title: "Information",
    description: "Here is some important information about this flow.",
    okText: "Got it",
    type: "info",
  },
};

export const Success: Story = {
  render: (arguments_) => <OpenAlertModalStory {...arguments_} />,
  args: {
    title: "Success",
    description: "Your action has been completed successfully.",
    okText: "Continue",
    type: "success",
  },
};

export const Error: Story = {
  render: (arguments_) => <OpenAlertModalStory {...arguments_} />,
  args: {
    title: "Delete item",
    description: "An error occurred. Retry the delete, or cancel to go back.",
    okText: "Retry delete",
    cancelText: "Cancel",
    type: "error",
  },
};

export const WithTextarea: Story = {
  render: () => <WithTextareaDemo />,
};

export const InteractionConfirm: Story = {
  render: (arguments_) => {
    const onConfirm = fn();

    return (
      <AlertModal
        {...arguments_}
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
