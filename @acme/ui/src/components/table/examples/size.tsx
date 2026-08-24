import type React from "react";

import type { TableProps } from "@acme/ui/components/table";
import { Table } from "@acme/ui/components/table";

interface DataType {
  key: string;
  name: string;
  money: string;
  address: string;
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Name",
    dataIndex: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    // Right-aligned AND sortable, so the demo also shows the sorter gutter
    // tracking the cell padding: the values stay under the label rather than
    // drifting under the trailing sort icon at any size.
    title: "Cash Assets",
    dataIndex: "money",
    align: "right",
    sorter: (a, b) => a.money.localeCompare(b.money),
  },
  {
    title: "Address",
    dataIndex: "address",
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    money: "￥300,000.00",
    address: "New York No. 1 Lake Park",
  },
  {
    key: "2",
    name: "Jim Green",
    money: "￥1,256,000.00",
    address: "London No. 1 Lake Park",
  },
  {
    key: "3",
    name: "Joe Black",
    money: "￥120,000.00",
    address: "Sydney No. 1 Lake Park",
  },
];

const sizes = [
  { size: "small", label: 'size="small" — 8px' },
  { size: "middle", label: 'size="middle" (default) — 12px' },
  { size: "large", label: 'size="large" — 16px' },
] as const;

/**
 * `size` sets the cell padding tier. Each table carries a title and a footer as
 * well, because those take the same tier as the cells.
 */
const App: React.FC = () => (
  <div className="flex flex-col gap-6">
    {sizes.map(({ size, label }) => (
      <Table<DataType>
        key={size}
        size={size}
        columns={columns}
        dataSource={data}
        bordered
        title={() => label}
        footer={() => label}
      />
    ))}
  </div>
);

export default App;
