"use client";

import type React from "react";
import { createContext, useContext } from "react";

import type { TabsType } from "./types";

interface TabsContextValue {
  type: TabsType;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const TabsProvider: React.FC<{
  children: React.ReactNode;
  type: TabsType;
}> = ({ children, type }) => {
  return (
    <TabsContext.Provider value={{ type }}>{children}</TabsContext.Provider>
  );
};

export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (context === undefined) {
    // Return default value instead of throwing error for backward compatibility
    return { type: "line" as TabsType };
  }
  return context;
};

