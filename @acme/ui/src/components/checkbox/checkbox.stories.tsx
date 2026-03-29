import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { JSX } from "react";

import type { CheckboxOptionType } from "./checkbox-group";
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

const audienceOptions: CheckboxOptionType<string>[] = [
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
  args: {
    "aria-label": "Accept terms",
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    "aria-label": "Checked checkbox",
  },
};

export const Card: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Checkbox defaultChecked variant="card">
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Auto Start</p>
          <p className="text-muted-foreground text-sm">
            Starting with your OS.
          </p>
        </div>
      </Checkbox>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <label htmlFor="disabled-unchecked" className={externalLabelClassName}>
          Disabled (unchecked)
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled checked />
        <label htmlFor="disabled-checked" className={externalLabelClassName}>
          Disabled (checked)
        </label>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

export const CheckboxGroup: Story = {
  render: () => (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <h3 className="text-sm font-medium">Choose your audience</h3>
        <p className="text-muted-foreground text-sm">
          Select the teams that should receive this update.
        </p>
      </div>
      <Checkbox.Group
        options={audienceOptions}
        defaultValue={["engineers"]}
        className="grid w-full max-w-3xl gap-3 md:grid-cols-3"
      />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="flex items-start space-x-3">
      <Checkbox id="description" className="mt-1" />
      <div className="grid gap-1.5">
        <label
          htmlFor="description"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Use different settings for my mobile devices
        </label>
        <p className="text-muted-foreground text-sm">
          You can manage your mobile notifications in the mobile settings page.
        </p>
      </div>
    </div>
  ),
};
