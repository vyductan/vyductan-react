import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bell, Mail, ShoppingCart } from "lucide-react";

import { TagWithCount } from "./tag-with-count";

const meta = {
  title: "Components/Tag/TagWithCount",
  component: TagWithCount,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Content to wrap with badge",
    },
    count: {
      control: "text",
      description: "Badge count display (number, string, or ReactNode)",
    },
    offset: {
      control: "object",
      description: "Position offset [left, top] in pixels",
    },
  },
} satisfies Meta<typeof TagWithCount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 5,
    children: "Content",
  },
};

export const WithCount: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-8">
      <TagWithCount {...args} count={5}>
        <Bell className="size-6" />
      </TagWithCount>
      <TagWithCount {...args} count={99}>
        <Mail className="size-6" />
      </TagWithCount>
      <TagWithCount {...args} count="NEW">
        <ShoppingCart className="size-6" />
      </TagWithCount>
    </div>
  ),
};

export const DotBadge: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-8">
      <TagWithCount
        {...args}
        aria-label="New notification"
        count={
          <span className="size-2 rounded-full bg-red-500" aria-hidden="true" />
        }
      >
        <Bell className="size-6" />
      </TagWithCount>
      <TagWithCount
        {...args}
        aria-label="Online"
        count={
          <span
            className="size-2 rounded-full bg-green-500"
            aria-hidden="true"
          />
        }
      >
        <Mail className="size-6" />
      </TagWithCount>
    </div>
  ),
};

export const WithOffset: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-8">
      <TagWithCount {...args} count={5} offset={[0, 0]}>
        <Bell className="size-6" />
      </TagWithCount>
      <TagWithCount {...args} count={10} offset={[-5, 5]}>
        <Mail className="size-6" />
      </TagWithCount>
    </div>
  ),
};
