/* eslint-disable unicorn/consistent-function-scoping */
"use client";

import React from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { GetComponent } from "../types";

type TableState = {
  getComponent: GetComponent;
  isSticky: boolean;
  scrollbarSize: number;
  tableLayout?: "auto" | "fixed";
};
type TableStore = TableState;

const defaultInitState: TableState = {
  scrollbarSize: 0,
  isSticky: false,
  getComponent: () => () => <></>,
  tableLayout: "auto",
};

const createTableStore = (initState: TableState = defaultInitState) => {
  return createStore<TableStore>()(() => ({
    ...initState,
  }));
};

type TableStoreApi = ReturnType<typeof createTableStore>;

const TableStoreContext = React.createContext<TableStoreApi | undefined>(
  undefined,
);

type TableStoreProviderProps = {
  children: React.ReactNode;
};
export const TableStoreProvider = ({ children }: TableStoreProviderProps) => {
  const storeRef = React.useRef<TableStoreApi>(null);
  storeRef.current ??= createTableStore({
    ...defaultInitState,
  });
  return (
    <TableStoreContext.Provider value={storeRef.current}>
      {children}
    </TableStoreContext.Provider>
  );
};

export function useTableStore(): TableStore;
export function useTableStore<T>(selector: (store: TableStore) => T): T;
export function useTableStore<T>(selector?: (store: TableStore) => T): T {
  const appStoreContext = React.useContext(TableStoreContext);

  if (!appStoreContext) {
    throw new Error(`useTableStore must be used within TableStoreProvider`);
  }

  return useStore(
    appStoreContext,
    selector ?? ((store: TableStore) => store as T),
  );
}
