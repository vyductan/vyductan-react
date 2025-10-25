import React from "react";

import type { SelectValueType } from "./types";

// Internal context to allow custom Option components to interact with Select
export const SelectContext = React.createContext<{
  selectedValues: SelectValueType[];
  triggerChange: (value?: SelectValueType) => void;
} | null>(null);
