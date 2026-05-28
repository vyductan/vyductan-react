import type { Meta, StoryObj } from "@storybook/react-vite";

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
      options: ["filled", "solid", "outlined"],
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
        "slate",
        "gray",
        "zinc",
        "neutral",
        "stone",
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose",
        "black",
        "white",
        "magenta",
        "volcano",
        "geekblue",
        "gold",
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
    variant: "filled",
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
