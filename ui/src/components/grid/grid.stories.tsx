import type { Meta, StoryObj } from "@storybook/react";

import { Col, Row } from "./index";

const meta = {
  title: "Components/Grid",
  component: Row,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Row>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-primary/20 border-primary/50 rounded border p-4 text-center ${className}`}
  >
    {children}
  </div>
);

export const Basic: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Row>
        <Col span={24}>
          <Box>col-24</Box>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Box>col-12</Box>
        </Col>
        <Col span={12}>
          <Box>col-12</Box>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Box>col-8</Box>
        </Col>
        <Col span={8}>
          <Box>col-8</Box>
        </Col>
        <Col span={8}>
          <Box>col-8</Box>
        </Col>
      </Row>
      <Row>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
      </Row>
    </div>
  ),
};

export const Gutters: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Row gutter={16}>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
      </Row>
      <Row gutter={[16, 24]}>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
        <Col span={6}>
          <Box>col-6</Box>
        </Col>
      </Row>
    </div>
  ),
};

export const Offset: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Row>
        <Col span={8}>
          <Box>col-8</Box>
        </Col>
        <Col span={8} offset={8}>
          <Box>col-8 offset-8</Box>
        </Col>
      </Row>
      <Row>
        <Col span={6} offset={6}>
          <Box>col-6 offset-6</Box>
        </Col>
        <Col span={6} offset={6}>
          <Box>col-6 offset-6</Box>
        </Col>
      </Row>
      <Row>
        <Col span={12} offset={6}>
          <Box>col-12 offset-6</Box>
        </Col>
      </Row>
    </div>
  ),
};

export const Responsive: Story = {
  render: () => (
    <Row gutter={10}>
      <Col xs={24} sm={12} md={8} lg={6} xl={4}>
        <Box>Col</Box>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={4}>
        <Box>Col</Box>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={4}>
        <Box>Col</Box>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={4}>
        <Box>Col</Box>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={4}>
        <Box>Col</Box>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={4}>
        <Box>Col</Box>
      </Col>
    </Row>
  ),
};
