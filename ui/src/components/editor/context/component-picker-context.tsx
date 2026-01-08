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

type CallbackFn = (isOpen: boolean) => void;
type SubscribeFn = (callbackFn: CallbackFn) => () => void;
type PublishFn = (isOpen: boolean) => void;
type ContextShape = [SubscribeFn, PublishFn];
type HookShape = [isOpen: boolean, setIsOpen: PublishFn];

const noopUnsubscribe = () => {
  return;
};

const noopSubscribe: SubscribeFn = () => noopUnsubscribe;

const noopPublish: PublishFn = () => {
  return;
};

const Context: React.Context<ContextShape> = createContext([
  noopSubscribe,
  noopPublish,
]);

export function ComponentPickerContext({ children }: { children: ReactNode }) {
  const isOpenRef = React.useRef<boolean>(false);
  const context: ContextShape = useMemo(() => {
    const listeners = new Set<CallbackFn>();
    return [
      (cb: (isOpen: boolean) => void) => {
        cb(isOpenRef.current);
        listeners.add(cb);
        return () => {
          listeners.delete(cb);
        };
      },
      (isOpen: boolean) => {
        isOpenRef.current = isOpen;
        for (const listener of listeners) {
          listener(isOpen);
        }
      },
    ];
  }, [isOpenRef]);
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
