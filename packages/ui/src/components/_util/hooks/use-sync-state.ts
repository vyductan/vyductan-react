import * as React from "react";

import useForceUpdate from "./use-force-update";

type UseSyncStateProperties<T> = readonly [() => T, (newValue: T) => void];

export default function useSyncState<T>(
  initialValue: T,
): UseSyncStateProperties<T> {
  const reference = React.useRef<T>(initialValue);
  const forceUpdate = useForceUpdate();

  return [
    () => reference.current,
    (newValue: T) => {
      reference.current = newValue;
      // re-render
      forceUpdate();
    },
  ] as const;
}
