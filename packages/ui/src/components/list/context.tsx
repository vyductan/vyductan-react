import type React from "react";
import { createContext, useContext } from "react";

import type { SizeType } from "../config-provider/size-context";

interface ListContextValue {
  itemLayout: "horizontal" | "vertical";
  size: SizeType;
}

const ListContext = createContext<ListContextValue | undefined>(undefined);

export const ListProvider: React.FC<{
  children: React.ReactNode;
  itemLayout: "horizontal" | "vertical";
  size: SizeType;
}> = ({ children, itemLayout, size }) => {
  return (
    <ListContext.Provider value={{ itemLayout, size }}>
      {children}
    </ListContext.Provider>
  );
};

export const useListContext = () => {
  const context = useContext(ListContext);
  if (context === undefined) {
    throw new Error("useListContext must be used within a ListProvider");
  }
  return context;
};
