/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import type { ColumnsType } from "./types";
import { OwnTable as Table } from "./table";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: ColumnsType<DataType> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-accent text-accent-foreground mr-1 rounded px-1 py-0.5 text-xs"
          >
            {tag.toUpperCase()}
          </span>
        ))}
      </>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <div className="flex gap-2">
        <a className="text-primary hover:underline">Invite {record.name}</a>
        <a className="text-destructive hover:underline">Delete</a>
      </div>
    ),
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["loser"],
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
];

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    bordered: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
    size: {
      control: "radio",
      options: ["small", "middle", "large"],
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    columns: columns as any,
    dataSource: data,
  },
};

export const Selection: Story = {
  render: (args: any) => {
    return (
      <Table
        {...args}
        rowSelection={{
          onChange: fn(),
        }}
      />
    );
  },
  args: {
    columns: columns as any,
    dataSource: data,
  },
};

export const Pagination: Story = {
  args: {
    columns: columns as any,
    dataSource: Array.from({ length: 46 }).map((_, i) => ({
      key: i.toString(),
      name: `Edward King ${i}`,
      age: 32,
      address: `London, Park Lane no. ${i}`,
      tags: ["nice", "developer"],
    })),
    pagination: {
      pageSize: 10,
    },
  },
};

export const Loading: Story = {
  args: {
    columns: columns as any,
    dataSource: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns: columns as any,
    dataSource: [],
  },
};
