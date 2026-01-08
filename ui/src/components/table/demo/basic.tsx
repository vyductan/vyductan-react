import type React from "react";

import type { TableProps } from "@acme/ui/components/table";
import { Space } from "@acme/ui/components/space";
import { Table } from "@acme/ui/components/table";
import { Tag } from "@acme/ui/components/tag";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: TableProps<DataType>["columns"] = [
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
      <div className="flex items-center gap-2">
        {tags.map((tag) => {
          let color = tag.length > 5 ? "indigo" : "green";
          if (tag === "loser") {
            color = "orange";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </div>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
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
    address:
      "Kucukayasofya Mah. Donus SOKAK Uyar Apt. No:3 34000 Istanbul,Turkey",
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

const App: React.FC = () => (
  <Table<DataType> columns={columns} dataSource={data} />
);

export default App;
