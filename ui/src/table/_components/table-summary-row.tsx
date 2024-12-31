import { TableRow } from ".";

type SummaryRowProps = {
  children?: React.ReactNode;
};
export const TableSummaryRow = ({ children }: SummaryRowProps) => {
  return <TableRow>{children}</TableRow>;
};
