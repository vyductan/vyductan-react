/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { ReactNode } from "react";
import * as React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CallbackFunction = (isOpen: boolean) => void;
type SubscribeFunction = (callbackFunction: CallbackFunction) => () => void;
type PublishFunction = (isOpen: boolean) => void;
type ContextShape = [SubscribeFunction, PublishFunction];
type HookShape = [isOpen: boolean, setIsOpen: PublishFunction];

const noopUnsubscribe = () => {
  return;
};

const noopSubscribe: SubscribeFunction = () => noopUnsubscribe;

const noopPublish: PublishFunction = () => {
  return;
};

const Context: React.Context<ContextShape> = createContext([
  noopSubscribe,
  noopPublish,
]);

export function ComponentPickerContext({ children }: { children: ReactNode }) {
  const isOpenReference = React.useRef<boolean>(false);
  const context: ContextShape = useMemo(() => {
    const listeners = new Set<CallbackFunction>();
    return [
      (callback: (isOpen: boolean) => void) => {
        callback(isOpenReference.current);
        listeners.add(callback);
        return () => {
          listeners.delete(callback);
        };
      },
      (isOpen: boolean) => {
        isOpenReference.current = isOpen;
        for (const listener of listeners) {
          listener(isOpen);
        }
      },
    ];
  }, [isOpenReference]);
  return <Context.Provider value={context}>{children}</Context.Provider>;
}

export const useComponentPickerContext = (): HookShape => {
  const [subscribe, publish]: ContextShape = useContext(Context);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    return subscribe((newIsOpen: boolean) => {
      setIsOpen(newIsOpen);
    });
  }, [subscribe]);
  return [isOpen, publish];
};
