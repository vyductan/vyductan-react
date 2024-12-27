import * as React from "react";

import type { StickyOffsets, TableColumnDef } from "../types";

type FlattenColumns<RecordType> = readonly (TableColumnDef<RecordType> & {
  scrollbar?: boolean;
})[];

const SummaryContext = React.createContext<{
  stickyOffsets?: StickyOffsets;
  scrollColumnIndex?: number;
  flattenColumns?: FlattenColumns<any>;
}>({});

export default SummaryContext;
