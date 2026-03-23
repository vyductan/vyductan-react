import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ShadcnDemo from "./demo/shadcn";

const meta = {
  title: "Components/Form",
  component: ShadcnDemo,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ShadcnDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Shadcn: Story = {};

export const ShadcnWithPasswordError: Story = {
  render: () => <ShadcnDemo showPasswordError />,
};
