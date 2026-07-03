import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, JSX } from "react";

import { ComponentSource } from "../mdx/component-source";
import BasicExample from "./examples/basic";
import CountExample from "./examples/count";
import IconExample from "./examples/icon";
import ScrollableExample from "./examples/scrollable";
import SizeExample from "./examples/size";
import TooltipExample from "./examples/tooltip";
import { Segmented } from "./segmented";

const defaultOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

type SegmentedStoryArguments = ComponentProps<typeof Segmented>;

function renderInBackground(arguments_: SegmentedStoryArguments): JSX.Element {
  return (
    <div className="bg-background rounded-xl p-6">
      <Segmented {...arguments_} />
    </div>
  );
}

function renderBlock(arguments_: SegmentedStoryArguments): JSX.Element {
  return (
    <div className="bg-background w-96 rounded-xl p-6">
      <Segmented {...arguments_} />
    </div>
  );
}

const meta = {
  title: "Components/Segmented",
  component: Segmented,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "sm", "lg"],
    },
    block: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    defaultValue: "weekly",
    size: "default",
    block: false,
    disabled: false,
    options: defaultOptions,
  },
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Basic: Story = {
  render: () => (
    <ComponentSource
      src="segmented/examples/basic.tsx"
      __comp__={BasicExample}
    />
  ),
};

export const Count: Story = {
  render: () => (
    <ComponentSource
      src="segmented/examples/count.tsx"
      __comp__={CountExample}
    />
  ),
};

export const WithIcon: Story = {
  render: () => (
    <ComponentSource src="segmented/examples/icon.tsx" __comp__={IconExample} />
  ),
};

export const WithTooltip: Story = {
  render: () => (
    <ComponentSource
      src="segmented/examples/tooltip.tsx"
      __comp__={TooltipExample}
    />
  ),
};

export const Scrollable: Story = {
  render: () => (
    <ComponentSource
      src="segmented/examples/scrollable.tsx"
      __comp__={ScrollableExample}
    />
  ),
};

export const Size: Story = {
  render: () => (
    <ComponentSource src="segmented/examples/size.tsx" __comp__={SizeExample} />
  ),
};

export const BackgroundContrast: Story = {
  render: renderInBackground,
};

export const Block: Story = {
  args: {
    block: true,
  },
  render: renderBlock,
};
