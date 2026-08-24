import type React from "react";

import type { TableProps } from "@acme/ui/components/table";
import { Table } from "@acme/ui/components/table";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

// Ant Design's own demo pads the middle with generated columns so the table is
// guaranteed to overflow; the pinned columns are only interesting once there is
// something to scroll past them.
const fillerColumns: TableProps<DataType>["columns"] = Array.from(
  { length: 8 },
  (_, index) => ({
    title: `Column ${index + 1}`,
    dataIndex: "address",
    key: `filler-${index}`,
    width: 150,
  }),
);

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Full Name",
    dataIndex: "name",
    key: "name",
    fixed: "left",
    width: 140,
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
    fixed: "left",
    width: 80,
  },
  ...fillerColumns,
  {
    title: "Action",
    key: "action",
    fixed: "right",
    width: 100,
    render: () => <a>action</a>,
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "Olivia Bennett",
    age: 32,
    address: "New York Park",
  },
  {
    key: "2",
    name: "Ethan Carter",
    age: 40,
    address: "London Park",
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney Park",
  },
];

/**
 * `scroll.x` must be a number here — unlike Ant Design, this table does not
 * accept `"max-content"` — so it states the columns' total width: 140 + 80 +
 * 8 x 150 + 100.
 */
const App: React.FC = () => (
  <Table<DataType> columns={columns} dataSource={data} scroll={{ x: 1520 }} />
);

export default App;
