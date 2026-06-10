import type { Meta, StoryObj } from "@storybook/react-vite";
import type * as React from "react";

import { ComponentSource } from "../mdx/component-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import BasicExample from "./examples/basic";
import ButtonStyleExample from "./examples/button-style";
import CardExample from "./examples/card";
import CardComposableExample from "./examples/card-composable";
import ColorExample from "./examples/color";
import DisabledExample from "./examples/disabled";
import { Radio } from "./radio";

const meta = {
  title: "Components/Radio",
  component: Radio,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    disabled: {
      control: "boolean",
    },
    variant: {
      control: "select",
      options: ["default", "card"],
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ComponentSource src="radio/examples/basic.tsx" __comp__={BasicExample} />
  ),
};

export const ButtonStyle: Story = {
  render: () => (
    <ComponentSource
      src="radio/examples/button-style.tsx"
      __comp__={ButtonStyleExample}
    />
  ),
};

export const Color: Story = {
  render: () => (
    <ComponentSource src="radio/examples/color.tsx" __comp__={ColorExample} />
  ),
};

export const Disabled: Story = {
  render: () => (
    <ComponentSource
      src="radio/examples/disabled.tsx"
      __comp__={DisabledExample}
    />
  ),
};

function CompareTabs({
  standardSrc,
  standardComp,
  composableSrc,
  composableComp,
}: {
  standardSrc: string;
  standardComp: React.FC;
  composableSrc: string;
  composableComp: React.FC;
}): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Tabs defaultValue="standard-api" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="standard-api">Standard API</TabsTrigger>
          <TabsTrigger value="composable-api">Composable API</TabsTrigger>
        </TabsList>
        <TabsContent
          value="standard-api"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ComponentSource src={standardSrc} __comp__={standardComp} />
        </TabsContent>
        <TabsContent
          value="composable-api"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ComponentSource src={composableSrc} __comp__={composableComp} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Card: Story = {
  render: () => (
    <CompareTabs
      standardSrc="radio/examples/card.tsx"
      standardComp={CardExample}
      composableSrc="radio/examples/card-composable.tsx"
      composableComp={CardComposableExample}
    />
  ),
};
