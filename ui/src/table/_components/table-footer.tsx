import * as React from "react";

import type { AnyObject } from "../../types";
import type { StickyOffsets, TableColumnDef } from "../types";
import { cn } from "../..";

// import SummaryContext from "./table-summary-context";

type FlattenColumns<TRecord> = readonly (TableColumnDef<TRecord> & {
  scrollbar?: boolean;
})[];

export type FooterProps<TRecord> =
  React.HTMLAttributes<HTMLTableSectionElement> & {
    ref?: React.Ref<HTMLTableSectionElement>;
    children: React.ReactNode;

    stickyOffsets?: StickyOffsets;
    flattenColumns?: FlattenColumns<TRecord>;
  };

const TableFooter = <TRecord extends AnyObject>({
  ref,
  className,
  // stickyOffsets, flattenColumns,
  ...props
}: FooterProps<TRecord>) => {
  //   const lastColumnIndex = flattenColumns.length - 1;
  //   const scrollColumn = flattenColumns[lastColumnIndex];

  //   const summaryContext = React.useMemo(
  //     () => ({
  //       stickyOffsets,
  //       flattenColumns,
  //       scrollColumnIndex: scrollColumn?.scrollbar ? lastColumnIndex : undefined,
  //     }),
  //     [scrollColumn, flattenColumns, lastColumnIndex, stickyOffsets],
  //   );

  //   console.log("fffff", flattenColumns);
  return (
    <>
      {/* <SummaryContext.Provider value={summaryContext}> */}
      <tfoot
        ref={ref}
        className={cn(
          "border-t bg-muted/50 font-medium",
          //   "[&>tr]:last:border-b-0",
          "[&_tr:last-child>td]:border-b-0",
          className,
        )}
        {...props}
      />
      {/* </SummaryContext.Provider> */}
    </>
  );
};
TableFooter.displayName = "TableFooter";

// const TableFooter = React.forwardRef<
//   HTMLTableSectionElement,
//   React.HTMLAttributes<HTMLTableSectionElement>
// >(({ className, ...props }, ref) => (
//   <tfoot
//     ref={ref}
//     className={cn(
//       "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
//       className,
//     )}
//     {...props}
//   />
// ));
// TableFooter.displayName = "TableFooter";
// export default responseImmutable(Footer);

export { TableFooter };
