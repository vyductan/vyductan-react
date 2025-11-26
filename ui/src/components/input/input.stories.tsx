import type { Meta, StoryObj } from "@storybook/react";
import { Lock, Mail, Search, User } from "lucide-react";

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
