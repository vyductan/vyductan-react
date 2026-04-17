import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type * as React from "react";

import { ComponentSource } from "../mdx/component-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import BasicExample from "./examples/basic";
import BasicShadcnLikeExample from "./examples/basic-shadcn-like";
import DefaultSpacingExample from "./examples/default-spacing";
import { Popover } from "./popover";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    trigger: {
      control: { type: "radio" },
      options: ["click", "hover", "focus"],
    },
    arrow: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;
type ExampleStory = Pick<Story, "render">;

function CompareTabs({
  antLikeSrc,
  antLikeComp,
  shadcnLikeSrc,
  shadcnLikeComp,
}: {
  antLikeSrc: string;
  antLikeComp: React.FC;
  shadcnLikeSrc: string;
  shadcnLikeComp: React.FC;
}): React.JSX.Element {
  return (
    <div className="mx-auto w-full sm:w-3xl">
      <Tabs defaultValue="standard-api" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="standard-api">Standard API</TabsTrigger>
          <TabsTrigger value="composable-api">Composable API</TabsTrigger>
        </TabsList>
        <TabsContent value="standard-api">
          <ComponentSource src={antLikeSrc} __comp__={antLikeComp} />
        </TabsContent>
        <TabsContent value="composable-api">
          <ComponentSource src={shadcnLikeSrc} __comp__={shadcnLikeComp} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Basic: ExampleStory = {
  render: () => (
    <CompareTabs
      antLikeSrc="popover/examples/basic.tsx"
      antLikeComp={BasicExample}
      shadcnLikeSrc="popover/examples/basic-shadcn-like.tsx"
      shadcnLikeComp={BasicShadcnLikeExample}
    />
  ),
};

export const DefaultSpacing: ExampleStory = {
  render: () => (
    <ComponentSource
      src="popover/examples/default-spacing.tsx"
      __comp__={DefaultSpacingExample}
    />
  ),
};
