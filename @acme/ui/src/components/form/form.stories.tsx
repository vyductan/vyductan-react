import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import AntdBasicDemo from "./examples/antd-basic";
import BasicShadcnDemo from "./examples/basic-shadcn";
import FieldExtraDemo from "./examples/field-extra";
import FloatingLabelSizesDemo from "./examples/floating-label-sizes";
import FormSizesDemo from "./examples/sizes";

const meta = {
  title: "Components/Form",
  component: BasicShadcnDemo,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof BasicShadcnDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AntdBasic: Story = {
  render: () => <AntdBasicDemo />,
};

export const BasicShadcn: Story = {};

export const FloatingLabelSizes: Story = {
  render: () => <FloatingLabelSizesDemo />,
};

export const Sizes: Story = {
  render: () => <FormSizesDemo />,
};

export const FieldExtra: Story = {
  render: () => <FieldExtraDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // `extra` is visible before any validation.
    await expect(
      canvas.getByText("Password must contain letters and numbers."),
    ).toBeInTheDocument();

    // Submit empty to surface the password error.
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));

    await expect(
      await canvas.findByText("Please input your password!"),
    ).toBeInTheDocument();

    // `extra` persists alongside the error.
    await expect(
      canvas.getByText("Password must contain letters and numbers."),
    ).toBeInTheDocument();
  },
};
