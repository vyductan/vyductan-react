import type React from "react";
import { useMemo, useState } from "react";

import type { TableColumnsType, TableProps } from "@acme/ui/components/table";
import { Input } from "@acme/ui/components/input";
import { Table } from "@acme/ui/components/table";

interface DataType {
  id: number;
  name: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
];

const data: DataType[] = [
  { id: 1, name: "John Brown" },
  { id: 2, name: "Jim Green" },
  { id: 3, name: "Joe Black" },
  { id: 4, name: "Jane Doe" },
];

const App: React.FC = () => {
  const [search, setSearch] = useState("");
  // `selectedRowKeys` is `number[]`, so `TKey` resolves to `number` and
  // `onChange` hands back `number[]` instead of `Key[]`.
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([2]);

  const filtered = useMemo(
    () =>
      data.filter((row) =>
        row.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const rowSelection: TableProps<DataType, number>["rowSelection"] = {
    selectedRowKeys,
    onChange: (nextSelectedRowKeys) => {
      // `nextSelectedRowKeys: number[]` — rows hidden by the filter (e.g.
      // "Jim Green" while searching "jo") are still returned as their numeric
      // id, so the selection stays a valid `number[]` to submit.
      setSelectedRowKeys(nextSelectedRowKeys);
    },
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="Filter by name…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <Table<DataType, number>
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        rowSelection={rowSelection}
      />
      <div className="text-muted-foreground text-sm">
        Selected ids: {JSON.stringify(selectedRowKeys)}
      </div>
    </div>
  );
};

export default App;
