import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type * as React from "react";

import { Label } from "../label";
import { ComponentSource } from "../mdx/component-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import BasicExample from "./examples/basic";
import CardExample from "./examples/card";
import CardComposableExample from "./examples/card-composable";
import CheckAllExample from "./examples/check-all";
import FormItemDescriptionExample from "./examples/form-item-description";
import GroupExample from "./examples/group";
import { Checkbox } from "./index";

const externalLabelClassName =
  "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    disabled: {
      control: "boolean",
    },
    checked: {
      control: "select",
      options: [true, false, "indeterminate"],
    },
    variant: {
      control: "select",
      options: ["default", "card"],
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ComponentSource
      src="checkbox/examples/basic.tsx"
      __comp__={BasicExample}
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
      standardSrc="checkbox/examples/card.tsx"
      standardComp={CardExample}
      composableSrc="checkbox/examples/card-composable.tsx"
      composableComp={CardComposableExample}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <Label htmlFor="disabled-unchecked" className={externalLabelClassName}>
          Disabled (unchecked)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled checked />
        <Label htmlFor="disabled-checked" className={externalLabelClassName}>
          Disabled (checked)
        </Label>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label
        htmlFor="terms"
        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </Label>
    </div>
  ),
};

export const CheckboxGroup: Story = {
  render: () => (
    <ComponentSource
      src="checkbox/examples/group.tsx"
      __comp__={GroupExample}
    />
  ),
};

export const CheckAll: Story = {
  render: () => (
    <ComponentSource
      src="checkbox/examples/check-all.tsx"
      __comp__={CheckAllExample}
    />
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="flex items-start space-x-3">
      <Checkbox id="description" className="mt-1" />
      <div className="grid gap-1.5">
        <Label
          htmlFor="description"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Use different settings for my mobile devices
        </Label>
        <p className="text-muted-foreground text-sm">
          You can manage your mobile notifications in the mobile settings page.
        </p>
      </div>
    </div>
  ),
};

export const FormItemDescription: Story = {
  render: () => (
    <ComponentSource
      src="checkbox/examples/form-item-description.tsx"
      __comp__={FormItemDescriptionExample}
    />
  ),
};
