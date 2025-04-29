/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable react-compiler/react-compiler */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect, useRef, useState } from "react";

export type Updater<State> = (prev: State) => State;

/**
 * Execute code before next frame but async
 */
export function useLayoutState<State>(
  defaultState: State,
): [State, (updater: Updater<State>) => void] {
  const stateRef = useRef(defaultState);
  const [, forceUpdate] = useState({});

  const lastPromiseRef = useRef<Promise<void>>(null);
  const updateBatchRef = useRef<Updater<State>[]>([]);

  function setFrameState(updater: Updater<State>) {
    updateBatchRef.current.push(updater);

    const promise = Promise.resolve();
    lastPromiseRef.current = promise;

    promise.then(() => {
      if (lastPromiseRef.current === promise) {
        const prevBatch = updateBatchRef.current;
        const prevState = stateRef.current;
        updateBatchRef.current = [];

        prevBatch.forEach((batchUpdater) => {
          stateRef.current = batchUpdater(stateRef.current);
        });

        lastPromiseRef.current = null;

        if (prevState !== stateRef.current) {
          forceUpdate({});
        }
      }
    });
  }

  useEffect(
    () => () => {
      lastPromiseRef.current = null;
    },
    [],
  );

  return [stateRef.current, setFrameState];
}
