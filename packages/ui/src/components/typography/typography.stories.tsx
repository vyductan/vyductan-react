import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Typography } from ".";
import { Space } from "../space";

const meta = {
  title: "Components/Typography",
  component: Typography,
  parameters: {
    layout: "centered",
    controls: { disable: true },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextAndLink: Story = {
  render: () => (
    <Space direction="vertical">
      <Typography.Text>Ant Design (default)</Typography.Text>
      <Typography.Text type="secondary">Ant Design (secondary)</Typography.Text>
      <Typography.Text type="success">Ant Design (success)</Typography.Text>
      <Typography.Text type="warning">Ant Design (warning)</Typography.Text>
      <Typography.Text type="danger">Ant Design (danger)</Typography.Text>
      <Typography.Text disabled>Ant Design (disabled)</Typography.Text>
      <Typography.Text mark>Ant Design (mark)</Typography.Text>
      <Typography.Text code>Ant Design (code)</Typography.Text>
      <Typography.Text keyboard>Ant Design (keyboard)</Typography.Text>
      <Typography.Text underline>Ant Design (underline)</Typography.Text>
      <Typography.Text delete>Ant Design (delete)</Typography.Text>
      <Typography.Text strong>Ant Design (strong)</Typography.Text>
      <Typography.Text italic>Ant Design (italic)</Typography.Text>
      <Typography.Link
        href="https://ant.design"
        target="_blank"
        rel="noreferrer"
      >
        Ant Design (Link)
      </Typography.Link>
    </Space>
  ),
};
