import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps, JSX } from "react";

import { Segmented } from "./segmented";

const defaultOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

type SegmentedStoryArgs = ComponentProps<typeof Segmented>;

function renderInBackground(args: SegmentedStoryArgs): JSX.Element {
  return (
    <div className="rounded-xl bg-background p-6">
      <Segmented {...args} />
    </div>
  );
}

function renderBlock(args: SegmentedStoryArgs): JSX.Element {
  return (
    <div className="w-96 rounded-xl bg-background p-6">
      <Segmented {...args} />
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

export const BackgroundContrast: Story = {
  render: renderInBackground,
};

export const Block: Story = {
  args: {
    block: true,
  },
  render: renderBlock,
};
