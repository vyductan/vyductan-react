"use client";

import * as React from "react";

/**
 * The current time, or `null` on the server and during hydration.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: the clock is an
 * external source of truth, which is exactly what this hook is for, and it is
 * the only way to return one value for the server render and another after
 * hydration without either a mismatch or a setState inside an effect (banned by
 * `react-hooks/set-state-in-effect`, and rightly — it costs a second render of
 * the whole grid on mount).
 *
 * The snapshot is the interval BUCKET, not the timestamp. A snapshot that
 * changed on every read would make React re-render forever; bucketing makes it
 * stable between ticks, at the cost of the reported time being rounded down to
 * the interval — invisible on a minute-resolution indicator.
 */
export function useNow(intervalMs = 60_000): Date | null {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const id = setInterval(onStoreChange, intervalMs);
      return () => clearInterval(id);
    },
    [intervalMs],
  );

  const getSnapshot = React.useCallback(
    () => Math.floor(Date.now() / intervalMs),
    [intervalMs],
  );

  const bucket = React.useSyncExternalStore<number | null>(
    subscribe,
    getSnapshot,
    () => null,
  );

  return React.useMemo(
    () => (bucket === null ? null : new Date(bucket * intervalMs)),
    [bucket, intervalMs],
  );
}
