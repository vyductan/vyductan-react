import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Divider } from "./divider";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: [
        "center",
        "left",
        "right",
        "start",
        "end",
        "horizontal",
        "vertical",
      ],
    },
    type: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
    size: {
      control: "radio",
      options: ["small", "middle", "large"],
    },
    plain: {
      control: "boolean",
    },
    dashed: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
      <Divider />
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
    </div>
  ),
};

export const WithText: Story = {
  args: {
    children: "Text",
    orientation: "center",
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
      <Divider {...args}>Text</Divider>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
    </div>
  ),
};

export const Orientation: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Divider orientation="start">Left Text</Divider>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
      <Divider orientation="center">Center Text</Divider>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
      <Divider orientation="end">Right Text</Divider>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
    </div>
  ),
};

export const Plain: Story = {
  args: {
    plain: true,
    children: "Plain Text",
    orientation: "center",
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
      <Divider {...args}>Plain Text</Divider>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center">
      Text
      <Divider type="vertical" />
      <a href="#">Link</a>
      <Divider type="vertical" />
      <a href="#">Link</a>
    </div>
  ),
};

export const Dashed: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
      <Divider dashed />
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
        merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
        quo modo.
      </p>
      <Divider dashed>Dashed with Text</Divider>
    </div>
  ),
};
