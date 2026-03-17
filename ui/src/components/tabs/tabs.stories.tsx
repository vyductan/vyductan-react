import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { fn } from "storybook/test";

import { Tabs } from "./index";

const items = [
  { key: "1", label: "Tab 1", children: "Content of Tab 1" },
  { key: "2", label: "Tab 2", children: "Content of Tab 2" },
  { key: "3", label: "Tab 3", children: "Content of Tab 3" },
];

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  args: {
    onChange: fn(),
  },
  argTypes: {
    type: {
      control: "select",
      options: ["line", "card", "solid"],
      description: "Type of tabs",
      table: {
        defaultValue: { summary: "line" },
      },
    },
    items: {
      description: "Tab items",
      control: "object",
    },
    activeKey: {
      control: "text",
      description: "Current active tab key",
    },
    defaultActiveKey: {
      control: "text",
      description: "Initial active tab key",
    },
    tabBarExtraContent: {
      control: false,
      description: "Extra content in tab bar",
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default (Line)
export const Default: Story = {
  args: {
    defaultActiveKey: "1",
    items,
    type: "line",
  },
};

// Card Type
export const Card: Story = {
  args: {
    defaultActiveKey: "1",
    items,
    type: "card",
  },
};

// Solid Type
export const Solid: Story = {
  args: {
    defaultActiveKey: "1",
    items,
    type: "solid",
  },
};

// With Extra Content
export const WithExtraContent: Story = {
  args: {
    defaultActiveKey: "1",
    items,
    type: "line",
    tabBarExtraContent: {
      left: (
        <span className="text-muted-foreground mr-4 font-medium">
          Left Extra
        </span>
      ),
      right: (
        <button className="text-primary text-sm hover:underline">Action</button>
      ),
    },
  },
};

// With Controlled State
export const Controlled: Story = {
  render: (args) => {
    const [activeKey, setActiveKey] = React.useState("1");
    const {
      value: _value,
      defaultValue: _defaultValue,
      onValueChange: _onValueChange,
      children: _children,
      ...rest
    } = args;

    const handleChange = (key: string) => {
      setActiveKey(key);
      args.onChange?.(key);
    };

    return (
      <Tabs
        {...rest}
        activeKey={activeKey}
        onChange={handleChange}
        items={items.map((item) => ({
          ...item,
          children: `Current active key: ${activeKey}. ${item.children}`,
        }))}
      />
    );
  },
  args: {
    type: "line",
    items,
  },
};
