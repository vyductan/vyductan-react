import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Modal,
} from ".";
import { Button } from "../button";

const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    a11y: {
      config: {
        rules: [
          {
            id: "aria-valid-attr-value",
            enabled: false,
          },
        ],
      },
    },
  },
  argTypes: {
    width: {
      control: "number",
    },
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
    confirmLoading: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <Modal
        {...args}
        open={open}
        onOpenChange={setOpen}
        trigger={<Button onClick={() => setOpen(true)}>Open Modal</Button>}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    );
  },
  args: {
    title: "Basic Modal",
    description: "This is a basic modal dialog.",
  },
};

export const CustomWidth: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <Modal
        {...args}
        open={open}
        onOpenChange={setOpen}
        trigger={<Button onClick={() => setOpen(true)}>Open Wide Modal</Button>}
        width={800}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <p>This modal has a custom width of 800px.</p>
      </Modal>
    );
  },
  args: {
    title: "Custom Width Modal",
  },
};

export const AsyncLogic: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOk = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 2000);
    };

    return (
      <Modal
        {...args}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button onClick={() => setOpen(true)}>Open Async Modal</Button>
        }
        confirmLoading={loading}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
      >
        <p>Click OK to trigger an async operation (2 seconds).</p>
      </Modal>
    );
  },
  args: {
    title: "Async Logic Modal",
    okText: "Submit",
  },
};

export const CustomFooter: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <Modal
        {...args}
        open={open}
        onOpenChange={setOpen}
        trigger={<Button onClick={() => setOpen(true)}>Custom Footer</Button>}
        footer={
          <div className="flex w-full justify-between">
            <Button variant="text" onClick={() => setOpen(false)}>
              Custom Left Button
            </Button>
            <div className="flex gap-2">
              <Button variant="outlined" onClick={() => setOpen(false)}>
                Return
              </Button>
              <Button type="primary" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </div>
          </div>
        }
      >
        <p>This modal has a completely custom footer.</p>
      </Modal>
    );
  },
  args: {
    title: "Custom Footer Modal",
  },
};

export const ShadcnStyle: Story = {
  render: () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                defaultValue="Pedro Duarte"
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="username"
                className="text-right text-sm font-medium"
              >
                Username
              </label>
              <input
                id="username"
                defaultValue="@peduarte"
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="primary">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};
