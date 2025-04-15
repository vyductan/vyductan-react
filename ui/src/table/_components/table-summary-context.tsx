import * as React from "react";

import type { ColumnDef, StickyOffsets } from "../types";

type FlattenColumns<RecordType> = readonly (ColumnDef<RecordType> & {
  scrollbar?: boolean;
})[];

const SummaryContext = React.createContext<{
  stickyOffsets?: StickyOffsets;
  scrollColumnIndex?: number;
  flattenColumns?: FlattenColumns<any>;
}>({});

export default SummaryContext;
