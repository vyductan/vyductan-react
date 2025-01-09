"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { ButtonProps } from "./button";
import type { DatePickerProps } from "./date-picker";
import type { PageContainerProps } from "./layout/page-container";
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
    link: {
      default: typeof Link;
    };
    result: {
      500?: {
        icon?: ReactNode;
        title?: ReactNode;
        subtitle?: ReactNode;
        extra?: ReactNode;
      };
    };
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

const UiConfigStoreContext = createContext<UiConfigStoreApi | undefined>(
  undefined,
);

type UiStoreProviderProps = {
  children: ReactNode;
  componentConfig?: Partial<UiConfigState["components"]>;
};
export const UiConfigProvider = ({
  children,
  componentConfig,
}: UiStoreProviderProps) => {
  const storeRef = useRef<UiConfigStoreApi>(null);
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
  const appStoreContext = useContext(UiConfigStoreContext);

  if (!appStoreContext) {
    throw new Error(`useUiConfig must be used within UiConfigProvider`);
  }

  return useStore(
    appStoreContext,
    selector ?? ((store: UiConfigStore) => store as T),
  );
}
