import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { InputNumber } from "./number";

const meta = {
  title: "Components/Input/InputNumber",
  component: InputNumber,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default: controls enabled -> spinner ▲▼ reveal on hover. allowClear is
// suppressed while controls are on (controls take priority) to avoid clutter.
export const Default: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber defaultValue={5} min={0} max={100} allowClear />
    </div>
  ),
};

// Clearable: turn controls off to get the clear icon ⊗ (reveal on hover/focus).
export const Clearable: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber
        defaultValue={5}
        min={0}
        max={100}
        controls={false}
        allowClear
      />
    </div>
  ),
};

// Controlled clearable: controls off so clear shows; value driven by state.
export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<number | null>(5);
    return (
      <div className="flex w-[320px] flex-col gap-4">
        <InputNumber
          value={value}
          onChange={setValue}
          min={0}
          max={100}
          controls={false}
          allowClear
        />
      </div>
    );
  },
};

// Right-aligned value (currency / accounting style) via the `align` prop.
export const RightAligned: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber
        defaultValue={1234}
        min={0}
        prefix="$"
        align="right"
        className="w-full"
      />
      <InputNumber
        defaultValue={98}
        min={0}
        suffix="%"
        align="right"
        className="w-full"
      />
    </div>
  ),
};

// Addons render outside the control border. Note: in `mode="spinner"` they are
// dropped on purpose (number.tsx:138) — the ▲▼ segment owns that edge instead.
export const WithAddons: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber
        aria-label="addon before"
        defaultValue={1234}
        min={0}
        addonBefore="$"
      />
      <InputNumber
        aria-label="addon after"
        defaultValue={98}
        min={0}
        max={100}
        addonAfter="%"
      />
      <InputNumber
        aria-label="addon both no controls"
        defaultValue={50}
        min={0}
        addonBefore="Qty"
        addonAfter="pcs"
        controls={false}
      />
      {/* spinner mode ignores addons */}
      <InputNumber
        mode="spinner"
        defaultValue={5}
        addonBefore="$"
        addonAfter="%"
      />
    </div>
  ),
  // Real-CSS guard for the addon inset: the wrapper is p-0 so the addons can
  // touch the border, which previously left the value flush against it. Measured
  // here rather than asserted as classes because which box owns the inset moves
  // with the affix wrapper (present with controls, absent without).
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("value stays inset from the control edge", async () => {
      for (const label of [
        "addon before",
        "addon after",
        "addon both no controls",
      ]) {
        const input = canvas.getByRole("spinbutton", { name: label });
        const innerBox =
          input.closest<HTMLElement>('[data-slot="affix-wrapper"]') ?? input;
        const textStart =
          input.getBoundingClientRect().left +
          Number.parseFloat(getComputedStyle(input).paddingLeft);

        await expect(
          textStart - innerBox.getBoundingClientRect().left,
        ).toBeGreaterThanOrEqual(11);
      }
    });
  },
};

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
