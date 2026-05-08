import type React from "react";

import type { TableColumnsType } from "@acme/ui/components/table";
import {
  Table,
  TableSummary,
  TableSummaryCell,
  TableSummaryRow,
} from "@acme/ui/components/table";

interface DataType {
  key: string;
  name: string;
  borrow: number;
  repayment: number;
}

const columns: TableColumnsType<DataType> = [
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Borrow",
    dataIndex: "borrow",
  },
  {
    title: "Repayment",
    dataIndex: "repayment",
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    borrow: 10,
    repayment: 33,
  },
  {
    key: "2",
    name: "Jim Green",
    borrow: 100,
    repayment: 0,
  },
  {
    key: "3",
    name: "Joe Black",
    borrow: 10,
    repayment: 10,
  },
];

const App: React.FC = () => (
  <Table<DataType>
    bordered
    columns={columns}
    dataSource={data}
    summary={(pageData) => {
      const totals = { borrow: 0, repayment: 0 };

      for (const record of pageData) {
        totals.borrow += record.borrow;
        totals.repayment += record.repayment;
      }

      return (
        <TableSummary>
          <TableSummaryRow>
            <TableSummaryCell index={0}>Total</TableSummaryCell>
            <TableSummaryCell index={1}>{totals.borrow}</TableSummaryCell>
            <TableSummaryCell index={2}>{totals.repayment}</TableSummaryCell>
          </TableSummaryRow>
        </TableSummary>
      );
    }}
  />
);

export default App;
