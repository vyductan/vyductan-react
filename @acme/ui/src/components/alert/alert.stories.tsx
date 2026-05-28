import type { Meta, StoryObj } from "@storybook/react-vite";

import { ComponentSource } from "../mdx/component-source";
import { Alert } from "./alert";
import BasicExample from "./examples/basic";
import DescriptionExample from "./examples/description";
import ShowIconExample from "./examples/show-icon";
import TypesExample from "./examples/types";
import WithoutBorderExample from "./examples/without-border";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["info", "success", "warning", "error"],
    },
    message: {
      control: "text",
    },
    description: {
      control: "text",
    },
    showIcon: {
      control: "boolean",
    },
    bordered: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;
type ExampleStory = Pick<Story, "render">;

export const Basic: ExampleStory = {
  render: () => (
    <ComponentSource src="alert/examples/basic.tsx" __comp__={BasicExample} />
  ),
};

export const Description: ExampleStory = {
  render: () => (
    <ComponentSource
      src="alert/examples/description.tsx"
      __comp__={DescriptionExample}
    />
  ),
};

export const Types: ExampleStory = {
  render: () => (
    <ComponentSource src="alert/examples/types.tsx" __comp__={TypesExample} />
  ),
};

export const ShowIcon: ExampleStory = {
  render: () => (
    <ComponentSource
      src="alert/examples/show-icon.tsx"
      __comp__={ShowIconExample}
    />
  ),
};

export const WithoutBorder: ExampleStory = {
  render: () => (
    <ComponentSource
      src="alert/examples/without-border.tsx"
      __comp__={WithoutBorderExample}
    />
  ),
};
