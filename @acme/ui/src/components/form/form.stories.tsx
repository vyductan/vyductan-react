import type { Meta, StoryObj } from "@storybook/react-vite";

import AntdBasicDemo from "./examples/antd-basic";
import BasicShadcnDemo from "./examples/basic-shadcn";
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
