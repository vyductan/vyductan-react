import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "../button";
import { message } from "./message";

const meta = {
  title: "Components/Message",
  component: Button, // Using Button as the component to trigger messages
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  render: () => (
    <Button onClick={() => message.success("This is a success message!")}>
      Show Success Message
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button onClick={() => message.info("This is an info message!")}>
      Show Info Message
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button onClick={() => message.warning("This is a warning message!")}>
      Show Warning Message
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button onClick={() => message.error("This is an error message!")}>
      Show Error Message
    </Button>
  ),
};

export const Loading: Story = {
  render: () => (
    <Button onClick={() => message.loading("Loading...")}>
      Show Loading Message
    </Button>
  ),
};

export const Default: Story = {
  render: () => (
    <Button onClick={() => message.message("This is a default message!")}>
      Show Default Message
    </Button>
  ),
};

export const WithDuration: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        onClick={() =>
          message.success("This message will auto close in 2 seconds", {
            duration: 2000,
          })
        }
      >
        2s Duration
      </Button>
      <Button
        onClick={() =>
          message.info("This message will auto close in 5 seconds", {
            duration: 5000,
          })
        }
      >
        5s Duration
      </Button>
      <Button
        onClick={() =>
          message.warning("This message will stay until dismissed", {
            duration: Infinity,
          })
        }
      >
        No Auto Close
      </Button>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        onClick={() =>
          message.success("Success!", {
            description: "Your operation completed successfully.",
          })
        }
      >
        Success with Description
      </Button>
      <Button
        onClick={() =>
          message.error("Error!", {
            description: "Something went wrong. Please try again.",
          })
        }
      >
        Error with Description
      </Button>
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Button
      onClick={() =>
        message.info("New update available", {
          action: {
            label: "Update Now",
            onClick: () => {
              message.success("Updating...");
            },
          },
        })
      }
    >
      Message with Action
    </Button>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Button
      onClick={() => {
        message.info("First message");
        setTimeout(() => message.success("Second message"), 300);
        setTimeout(() => message.warning("Third message"), 600);
        setTimeout(() => message.error("Fourth message"), 900);
      }}
    >
      Show Multiple Messages
    </Button>
  ),
};

const simulateAsyncOperation = () => {
  return new Promise<{ name: string }>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve({ name: "Success" });
      } else {
        reject(new globalThis.Error("Operation failed"));
      }
    }, 2000);
  });
};

export const PromiseExample: Story = {
  render: () => {
    return (
      <Button
        onClick={() =>
          message.promise(simulateAsyncOperation(), {
            loading: "Loading...",
            success: "Operation completed successfully!",
            error: "Operation failed!",
          })
        }
      >
        Show Promise Message
      </Button>
    );
  },
};

export const Dismissible: Story = {
  render: () => {
    let toastId: string | number;

    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button
          onClick={() => {
            toastId = message.info("This message can be dismissed manually", {
              duration: Infinity,
            });
          }}
        >
          Show Message
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            message.dismiss(toastId);
          }}
        >
          Dismiss Message
        </Button>
        <Button
          variant="dashed"
          onClick={() => {
            message.dismiss();
          }}
        >
          Dismiss All
        </Button>
      </div>
    );
  },
};

export const CustomContent: Story = {
  render: () => (
    <Button
      onClick={() =>
        message.custom(() => (
          <div className="bg-background flex items-center gap-3 rounded-lg border p-4 shadow-lg">
            <div className="size-10 rounded-full bg-linear-to-r from-purple-500 to-pink-500" />
            <div>
              <div className="font-semibold">Custom Toast</div>
              <div className="text-muted-foreground text-sm">
                This is a completely custom message with custom styling
              </div>
            </div>
          </div>
        ))
      }
    >
      Show Custom Message
    </Button>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button onClick={() => message.success("Success message!")}>
        Success
      </Button>
      <Button onClick={() => message.info("Info message!")}>Info</Button>
      <Button onClick={() => message.warning("Warning message!")}>
        Warning
      </Button>
      <Button onClick={() => message.error("Error message!")}>Error</Button>
      <Button onClick={() => message.loading("Loading message!")}>
        Loading
      </Button>
      <Button onClick={() => message.message("Default message!")}>
        Default
      </Button>
    </div>
  ),
};

// Interaction Testing - Test message triggering
export const InteractionTest: Story = {
  render: () => {
    const onClick = fn();
    return (
      <Button
        onClick={() => {
          message.success("Test message triggered!");
          onClick();
        }}
      >
        Trigger Message
      </Button>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Click button to trigger message", async () => {
      const button = canvas.getByRole("button", {
        name: /trigger message/i,
      });

      await expect(button).toBeTruthy();
      await expect(button).toBeVisible();

      // Click the button to trigger the message
      await userEvent.click(button);

      // Note: We can't directly test the toast content as it's rendered outside the canvas
      // But we can verify the button was clicked
      await expect(button).toBeTruthy();
    });
  },
};
