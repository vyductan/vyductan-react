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

type Suggestion = null | string;
type CallbackFn = (newSuggestion: Suggestion) => void;
type SubscribeFn = (callbackFn: CallbackFn) => () => void;
type PublishFn = (newSuggestion: Suggestion) => void;
type ContextShape = [SubscribeFn, PublishFn];
type HookShape = [suggestion: Suggestion, setSuggestion: PublishFn];

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
export function SharedAutocompleteContext({
  children,
}: {
  children: ReactNode;
}) {
  const suggestionRef = React.useRef<Suggestion>(null);
  const context: ContextShape = useMemo(() => {
    const listeners = new Set<CallbackFn>();
    return [
      (cb: (newSuggestion: Suggestion) => void) => {
        cb(suggestionRef.current);
        listeners.add(cb);
        return () => {
          listeners.delete(cb);
        };
      },
      (newSuggestion: Suggestion) => {
        suggestionRef.current = newSuggestion;
        for (const listener of listeners) {
          listener(newSuggestion);
        }
      },
    ];
  }, [suggestionRef]);
  return <Context.Provider value={context}>{children}</Context.Provider>;
}

export const useSharedAutocompleteContext = (): HookShape => {
  const [subscribe, publish]: ContextShape = useContext(Context);
  const [suggestion, setSuggestion] = useState<Suggestion>(null);
  useEffect(() => {
    return subscribe((newSuggestion: Suggestion) => {
      setSuggestion(newSuggestion);
    });
  }, [subscribe]);
  return [suggestion, publish];
};
