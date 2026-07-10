import type { Meta, StoryObj } from "@storybook/react-vite";

import BasicDemo from "./examples/basic";
import FormDemo from "./examples/form";

const meta = {
  title: "Components/Drawer",
  component: BasicDemo,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof BasicDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const FormInDrawer: Story = {
  render: () => <FormDemo />,
};
