import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import dayjs from "dayjs";

import { Calendar } from "./calendar";
import SizeDemo from "./examples/size";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(dayjs());
    return (
      <Calendar mode="single" value={value} onSelect={(date) => setValue(date)} />
    );
  },
};

/**
 * Calendar has no `size` prop. Cell dimensions are driven by the `--cell-size`
 * CSS variable (default `--spacing(8)` = 32px). Override it via `className` to
 * get Ant Design-like small / middle / large sizing. See `examples/size.tsx`.
 */
export const Sizes: Story = {
  render: () => <SizeDemo />,
};
