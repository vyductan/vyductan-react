"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { ButtonProps } from "./button";
import type { DatePickerProps } from "./date-picker";
import type { TagProps } from "./tag";

// type TDateFormat = {
//   date: string;
//   dateTime: string;
//   dateTimeWithSeconds: string;
// };
type UiState = {
  componentConfig?: {
    button?: Partial<Pick<ButtonProps, "classNames">>;
    datePicker?: Partial<Pick<DatePickerProps, "format">>;
    tag?: Partial<Pick<TagProps, "className" | "borderless">>;
    layout?: {
      pageContainer?: {
        loadingIcon?: ReactNode;
      };
    };
  };
};
// type UiActions = {
//   setUser: (user: User) => void;
// };
type UiStore = UiState;

const defaultInitState: UiState = {};

const createUserStore = (initState: UiState = defaultInitState) => {
  return createStore<UiStore>()(() => ({
    ...initState,
    // user: undefined,
    // setUser: (user) => set({ user }),
  }));
};

type UiStoreApi = ReturnType<typeof createUserStore>;

const UiStoreContext = createContext<UiStoreApi | undefined>(undefined);

type UiStoreProviderProps = Partial<UiState> & {
  children: ReactNode;
};
export const UiProvider = ({
  children,
  componentConfig,
}: UiStoreProviderProps) => {
  const storeRef = useRef<UiStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createUserStore({
      componentConfig: componentConfig ?? defaultInitState.componentConfig,
    });
  }
  return (
    <UiStoreContext.Provider value={storeRef.current}>
      {children}
    </UiStoreContext.Provider>
  );
};

export function useUi(): UiStore;
export function useUi<T>(selector: (store: UiStore) => T): T;
export function useUi<T>(selector?: (store: UiStore) => T): T {
  const appStoreContext = useContext(UiStoreContext);

  if (!appStoreContext) {
    throw new Error(`useUser must be used within UserStoreProvider`);
  }

  return useStore(
    appStoreContext,
    selector ?? ((store: UiStore) => store as T),
  );
}
