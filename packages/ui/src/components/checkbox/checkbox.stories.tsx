import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { JSX } from "react";

import type { CheckboxOptionType } from "./checkbox-group";
import { Label } from "../label";
import { ComponentSource } from "../mdx/component-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import BasicExample from "./examples/basic";
import CardComposableExample from "./examples/card-composable";
import CardExample from "./examples/card";
import { Checkbox } from "./index";

const externalLabelClassName =
  "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

function createAudienceLabel(title: string, description: string): JSX.Element {
  return (
    <div className="grid gap-1">
      <span className="font-medium">{title}</span>
      <span className="text-muted-foreground text-sm">{description}</span>
    </div>
  );
}

const audienceOptions: CheckboxOptionType[] = [
  {
    label: createAudienceLabel(
      "Product managers",
      "Roadmaps, priorities, and launch plans.",
    ),
    value: "product-managers",
  },
  {
    label: createAudienceLabel(
      "Engineers",
      "APIs, implementation details, and technical updates.",
    ),
    value: "engineers",
  },
  {
    label: createAudienceLabel(
      "Designers",
      "UX reviews, components, and design system changes.",
    ),
    value: "designers",
  },
];

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

type CheckboxGroupStory = StoryObj<typeof Checkbox.Group>;

export const CheckboxGroup: CheckboxGroupStory = {
  render: (args) => (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <h3 className="text-sm font-medium">Choose your audience</h3>
        <p className="text-muted-foreground text-sm">
          Select the teams that should receive this update.
        </p>
      </div>
      <Checkbox.Group
        {...args}
        className="grid w-full max-w-3xl gap-3 md:grid-cols-3"
      />
    </div>
  ),
  args: {
    options: audienceOptions,
    defaultValue: ["engineers"],
    value: undefined,
    disabled: false,
    optionVariant: "default",
  },
  argTypes: {
    checked: {
      table: { disable: true },
    },
    variant: {
      table: { disable: true },
    },
    options: {
      control: false,
      description: "Checkbox options",
    },
    defaultValue: {
      control: "object",
      description: "Default selected values (uncontrolled)",
    },
    value: {
      control: "object",
      description: "Selected values (controlled)",
    },
    disabled: {
      control: "boolean",
      description: "Disable all checkboxes in the group",
    },
    optionVariant: {
      control: "radio",
      options: ["default", "card"],
      description: "Variant of the checkbox options",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
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
