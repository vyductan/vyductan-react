import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExternalLink } from ".";

const meta = {
  title: "Components/Link/ExternalLink",
  component: ExternalLink,
  parameters: {
    layout: "centered",
  },
  args: {
    href: "https://vyductan.dev",
    children: "vyductan.dev",
  },
} satisfies Meta<typeof ExternalLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongLabel: Story = {
  args: {
    children: "Read the full documentation on our website",
  },
};

export const InParagraph: Story = {
  parameters: {
    layout: "padded",
  },
  render: (args) => (
    <p className="max-w-prose text-sm leading-6">
      Learn more by visiting{" "}
      <ExternalLink {...args} />, then come back here to continue.
    </p>
  ),
};

export const ExternalTarget: Story = {
  args: {
    href: "https://github.com/vyductan",
    children: "GitHub profile",
  },
};
