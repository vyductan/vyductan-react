import * as React from "react";

import type { InputSizeVariants } from "../input/variants";

export type SizeType = InputSizeVariants["size"];

const SizeContext = React.createContext<SizeType>(undefined);

export interface SizeContextProps {
  size?: SizeType;
  children?: React.ReactNode;
}

export const SizeContextProvider: React.FC<SizeContextProps> = ({
  children,
  size,
}) => {
  const originSize = React.useContext<SizeType>(SizeContext);
  return (
    <SizeContext.Provider value={size || originSize}>
      {children}
    </SizeContext.Provider>
  );
};

export default SizeContext;
