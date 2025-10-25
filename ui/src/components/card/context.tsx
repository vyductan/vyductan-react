import React from "react";

import type { SizeType } from "../config-provider/size-context";

type CardContextValue = {
  size?: SizeType;
};

const CardContext = React.createContext<CardContextValue>(
  {} as CardContextValue,
);

export { CardContext };
