"use client";

import React from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { ButtonProps } from "./button";
import type { DatePickerProps } from "./date-picker";
import type { PageContainerProps } from "./layout/page-container";
import type { PaginationProps } from "./pagination";
import type { TableProps } from "./table";
import type { TagProps } from "./tag";
import { Link } from "./link";

// type TDateFormat = {
//   date: string;
//   dateTime: string;
//   dateTimeWithSeconds: string;
// };
type UiConfigState = {
  components: {
    button?: Partial<Pick<ButtonProps, "classNames">>;
    datePicker?: Partial<Pick<DatePickerProps, "format">>;
    tag?: Partial<Pick<TagProps, "className" | "borderless">>;
    layout?: {
      pageContainer?: Partial<Pick<PageContainerProps, "loadingRender">>;
    };
    link?: {
      default?: typeof Link;
    };
    result: {
      500?: {
        icon?: React.ReactNode;
        title?: React.ReactNode;
        subtitle?: React.ReactNode;
        extra?: React.ReactNode;
      };
    };
    pagination?: Partial<Pick<PaginationProps, "itemRender">>;
    table?: Partial<Pick<TableProps, "bordered">>;
  };
};
type UiConfigStore = UiConfigState;

const defaultInitState: UiConfigState = {
  components: {
    link: {
      default: Link,
    },
    result: {
      500: {
        icon: <></>,
        title: <></>,
        subtitle: <></>,
        extra: <></>,
      },
    },
  },
};

const createUiConfigStore = (initState: UiConfigState = defaultInitState) => {
  return createStore<UiConfigStore>()(() => ({
    ...initState,
  }));
};

type UiConfigStoreApi = ReturnType<typeof createUiConfigStore>;

const UiConfigStoreContext = React.createContext<UiConfigStoreApi | undefined>(
  undefined,
);

type UiStoreProviderProps = {
  children: React.ReactNode;
  componentConfig?: Partial<UiConfigState["components"]>;
};
export const UiConfigProvider = ({
  children,
  componentConfig,
}: UiStoreProviderProps) => {
  const storeRef = React.useRef<UiConfigStoreApi>(null);
  if (!storeRef.current) {
    storeRef.current = createUiConfigStore({
      components: {
        ...defaultInitState.components,
        ...componentConfig,
      },
    });
  }
  return (
    <UiConfigStoreContext.Provider value={storeRef.current}>
      {children}
    </UiConfigStoreContext.Provider>
  );
};

export function useUiConfig(): UiConfigStore;
export function useUiConfig<T>(selector: (store: UiConfigStore) => T): T;
export function useUiConfig<T>(selector?: (store: UiConfigStore) => T): T {
  const appStoreContext = React.useContext(UiConfigStoreContext);

  if (!appStoreContext) {
    throw new Error(`useUiConfig must be used within UiConfigProvider`);
  }

  return useStore(
    appStoreContext,
    selector ?? ((store: UiConfigStore) => store as T),
  );
}
