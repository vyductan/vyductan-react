import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { InputNumber } from "./number";

const meta = {
  title: "Components/Input/InputNumber",
  component: InputNumber,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Spinner: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber mode="spinner" defaultValue={3} min={1} max={10} />
    </div>
  ),
};

export const PrefixSuffixSpinner: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber
        mode="spinner"
        defaultValue={2}
        prefix="Qty"
        suffix="items"
      />
    </div>
  ),
};

export const DisabledSpinner: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber mode="spinner" defaultValue={3} disabled />
    </div>
  ),
};

export const ReadOnlySpinner: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber mode="spinner" defaultValue={3} readOnly />
    </div>
  ),
};

export const CustomControlsIcons: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber
        mode="spinner"
        defaultValue={3}
        controls={{
          upIcon: <span className="text-xs font-medium">+</span>,
          downIcon: <span className="text-xs font-medium">−</span>,
        }}
      />
    </div>
  ),
};
