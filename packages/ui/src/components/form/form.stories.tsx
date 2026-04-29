import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import AntdBasicDemo from "./examples/antd-basic";
import ShadcnDemo from "./examples/shadcn";

const meta = {
  title: "Components/Form",
  component: ShadcnDemo,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ShadcnDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AntdBasic: Story = {
  render: () => <AntdBasicDemo />,
};

export const Shadcn: Story = {};

export const ShadcnWithPasswordError: Story = {
  render: () => <ShadcnDemo showPasswordError />,
};
