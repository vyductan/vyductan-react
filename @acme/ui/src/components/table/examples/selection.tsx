import type React from "react";
import { useState } from "react";

import type { TableColumnsType, TableProps } from "@acme/ui/components/table";
import { Table } from "@acme/ui/components/table";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
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
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
  },
  {
    key: "3",
    name: "Joe Black",
    age: 29,
    address: "Sydney No. 1 Lake Park",
  },
];

const App: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(["2"]);

  const rowSelection: TableProps<DataType>["rowSelection"] = {
    selectedRowKeys,
    onChange: (nextSelectedRowKeys) => {
      setSelectedRowKeys(nextSelectedRowKeys);
    },
  };

  return (
    <Table<DataType>
      columns={columns}
      dataSource={data}
      rowSelection={rowSelection}
    />
  );
};

export default App;
