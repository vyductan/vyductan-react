import React from "react";

import { TableCell } from ".";

// import { getCellFixedInfo } from "../utils/fixUtil";
// import SummaryContext from "./table-summary-context";

type SummaryCellProps = {
  index: number;
  children?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
};
export const TableSummaryCell = ({
  // index,
  children,
  colSpan = 1,
  rowSpan,
  className,
}: SummaryCellProps) => {
  // const { scrollColumnIndex, stickyOffsets, flattenColumns } =
  //   React.useContext(SummaryContext);
  // const lastIndex = index + colSpan - 1;
  // const mergedColSpan =
  //   lastIndex + 1 === scrollColumnIndex ? colSpan + 1 : colSpan;

  // const direction = "rtl";
  //   const fixedInfo = getCellFixedInfo(
  //     index,
  //     index + mergedColSpan - 1,
  //     flattenColumns,
  //     stickyOffsets,
  //     direction,
  //   );

  return (
    <TableCell
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={className}
      //{...fixedInfo}
    >
      {children}
    </TableCell>
  );
};
