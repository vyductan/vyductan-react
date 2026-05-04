import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ComponentSource } from "../mdx/component-source";
import BasicExample from "./examples/basic";
import DisabledExample from "./examples/disabled";
import ItemStatusExample from "./examples/item-status";
import SemanticSlotsExample from "./examples/semantic-slots";
import StatusBarExample from "./examples/status-bar";
import TitlePlacementExample from "./examples/title-placement";
import VerticalExample from "./examples/vertical";
import WithSubtitleAndContentExample from "./examples/with-subtitle-and-content";
import { Steps } from "./steps";

const meta = {
  title: "Components/Steps",
  component: Steps,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    current: {
      control: "number",
    },
    direction: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
    titlePlacement: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
    responsive: {
      control: "boolean",
    },
    status: {
      control: "radio",
      options: ["wait", "process", "finish", "error"],
    },
  },
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;
type ExampleStory = Pick<Story, "render">;

export const Basic: ExampleStory = {
  render: () => (
    <ComponentSource src="steps/examples/basic.tsx" __comp__={BasicExample} />
  ),
};

export const WithSubtitleAndContent: ExampleStory = {
  render: () => (
    <ComponentSource
      src="steps/examples/with-subtitle-and-content.tsx"
      __comp__={WithSubtitleAndContentExample}
    />
  ),
};

export const TitlePlacement: ExampleStory = {
  render: () => (
    <ComponentSource
      src="steps/examples/title-placement.tsx"
      __comp__={TitlePlacementExample}
    />
  ),
};

export const Vertical: ExampleStory = {
  render: () => (
    <ComponentSource
      src="steps/examples/vertical.tsx"
      __comp__={VerticalExample}
    />
  ),
};

export const ItemStatus: ExampleStory = {
  render: () => (
    <ComponentSource
      src="steps/examples/item-status.tsx"
      __comp__={ItemStatusExample}
    />
  ),
};

export const StatusBar: ExampleStory = {
  render: () => (
    <ComponentSource
      src="steps/examples/status-bar.tsx"
      __comp__={StatusBarExample}
    />
  ),
};

export const Disabled: ExampleStory = {
  render: () => (
    <ComponentSource
      src="steps/examples/disabled.tsx"
      __comp__={DisabledExample}
    />
  ),
};

export const SemanticSlots: ExampleStory = {
  render: () => (
    <ComponentSource
      src="steps/examples/semantic-slots.tsx"
      __comp__={SemanticSlotsExample}
    />
  ),
};
