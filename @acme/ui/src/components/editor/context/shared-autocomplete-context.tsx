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

type Suggestion = string | undefined;
type CallbackFunction = (newSuggestion: Suggestion) => void;
type SubscribeFunction = (callbackFunction: CallbackFunction) => () => void;
type PublishFunction = (newSuggestion: Suggestion) => void;
type ContextShape = [SubscribeFunction, PublishFunction];
type HookShape = [suggestion: Suggestion, setSuggestion: PublishFunction];

const noopUnsubscribe = () => {
  return;
};

const noopSubscribe: SubscribeFunction = () => noopUnsubscribe;

const noopPublish: PublishFunction = () => {
  return;
};

const Context: React.Context<ContextShape> = createContext<ContextShape>([
  noopSubscribe,
  noopPublish,
]);
export function SharedAutocompleteContext({
  children,
}: {
  children: ReactNode;
}) {
  const suggestionReference = React.useRef<Suggestion>(undefined);
  const context: ContextShape = useMemo(() => {
    const listeners = new Set<CallbackFunction>();
    return [
      (callback: (newSuggestion: Suggestion) => void) => {
        callback(suggestionReference.current);
        listeners.add(callback);
        return () => {
          listeners.delete(callback);
        };
      },
      (newSuggestion: Suggestion) => {
        suggestionReference.current = newSuggestion;
        for (const listener of listeners) {
          listener(newSuggestion);
        }
      },
    ];
  }, [suggestionReference]);
  return <Context.Provider value={context}>{children}</Context.Provider>;
}

export const useSharedAutocompleteContext = (): HookShape => {
  const [subscribe, publish]: ContextShape = useContext(Context);
  const [suggestion, setSuggestion] = useState<Suggestion>();
  useEffect(() => {
    return subscribe((newSuggestion: Suggestion) => {
      setSuggestion(newSuggestion);
    });
  }, [subscribe]);
  return [suggestion, publish];
};
