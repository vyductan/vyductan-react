import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type * as React from "react";

import { ComponentSource } from "../mdx/component-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { Combobox } from "./combobox";
import AllowClearExample from "./examples/allow-clear";
import BasicExample from "./examples/basic";
import BasicShadcnLikeExample from "./examples/basic-shadcn-like";
import CustomClearIconExample from "./examples/custom-clear-icon";
import MultipleExample from "./examples/multiple";
import MultipleShadcnLikeExample from "./examples/multiple-shadcn-like";
import NumericExample from "./examples/numeric";
import TagsExample from "./examples/tags";

const meta = {
  title: "Components/Combobox",
  component: Combobox,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    mode: {
      control: "radio",
      options: ["multiple", "tags"],
    },
    allowClear: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Combobox>;

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
        <TabsContent
          value="standard-api"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ComponentSource src={antLikeSrc} __comp__={antLikeComp} />
        </TabsContent>
        <TabsContent
          value="composable-api"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ComponentSource src={shadcnLikeSrc} __comp__={shadcnLikeComp} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Basic: ExampleStory = {
  render: () => (
    <CompareTabs
      antLikeSrc="combobox/examples/basic.tsx"
      antLikeComp={BasicExample}
      shadcnLikeSrc="combobox/examples/basic-shadcn-like.tsx"
      shadcnLikeComp={BasicShadcnLikeExample}
    />
  ),
};

export const Multiple: ExampleStory = {
  render: () => (
    <CompareTabs
      antLikeSrc="combobox/examples/multiple.tsx"
      antLikeComp={MultipleExample}
      shadcnLikeSrc="combobox/examples/multiple-shadcn-like.tsx"
      shadcnLikeComp={MultipleShadcnLikeExample}
    />
  ),
};

export const Numeric: ExampleStory = {
  render: () => (
    <ComponentSource
      src="combobox/examples/numeric.tsx"
      __comp__={NumericExample}
    />
  ),
};

export const Tags: ExampleStory = {
  render: () => (
    <ComponentSource src="combobox/examples/tags.tsx" __comp__={TagsExample} />
  ),
};

export const AllowClear: ExampleStory = {
  render: () => (
    <ComponentSource
      src="combobox/examples/allow-clear.tsx"
      __comp__={AllowClearExample}
    />
  ),
};

export const CustomClearIcon: ExampleStory = {
  render: () => (
    <ComponentSource
      src="combobox/examples/custom-clear-icon.tsx"
      __comp__={CustomClearIconExample}
    />
  ),
};
