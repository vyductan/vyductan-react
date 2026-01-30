import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from ".";
import { Icon } from "../../icons";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Badge",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const WithCount: Story = {
  args: {
    count: 5,
    children: <div className="h-10 w-10 rounded-lg bg-gray-200" />,
  },
};

export const WithIcon: Story = {
  render: (args) => (
    <Badge {...args}>
      <Icon icon="icon-[lucide--plus]" className="mr-1 h-3 w-3" />
      Badge
    </Badge>
  ),
};

export const CountOnly: Story = {
  args: {
    count: 10,
  },
};
