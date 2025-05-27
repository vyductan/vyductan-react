import React from "react";

import type { SizeType } from "@acme/ui/types";

type CardContextValue = {
  size?: SizeType;
};

const CardContext = React.createContext<CardContextValue>(
  {} as CardContextValue,
);

export { CardContext };
