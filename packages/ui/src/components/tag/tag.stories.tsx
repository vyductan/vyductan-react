import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ComponentSource } from "../mdx/component-source";
import ColorfulExample from "./examples/colorful";
import { Tag } from "./tag";

const meta = {
  title: "Components/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "filled", "solid", "outlined"],
    },
    color: {
      control: "select",
      options: [
        "default",
        "primary",
        "success",
        "processing",
        "error",
        "warning",
        "orange",
        "gray",
        "yellow",
        "amber",
        "lime",
        "blue",
        "indigo",
        "fuchsia",
        "green",
        "cyan",
        "red",
        "rose",
        "pink",
        "purple",
        "teal",
        "#f50",
        "#2db7f5",
        "#87d068",
        "#108ee9",
      ],
    },
    size: {
      control: "radio",
      options: ["default", "small", "large"],
    },
    closeIcon: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Tag",
    variant: "default",
    color: "default",
    size: "default",
  },
};

export const Colorful: Story = {
  render: () => (
    <ComponentSource
      src="tag/examples/colorful.tsx"
      __comp__={ColorfulExample}
    />
  ),
};
