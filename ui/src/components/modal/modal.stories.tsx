import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Button } from "../button";
import { Modal } from "./modal";

const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
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
