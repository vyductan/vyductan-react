/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from "react";

import type { SizeType } from "../size-context";
import SizeContext from "../size-context";

const useSize = <T extends string | undefined | number | object>(
  customSize?: T | ((ctxSize: SizeType) => T),
): T => {
  const size = React.useContext<SizeType>(SizeContext);
  const mergedSize = React.useMemo<T>(() => {
    if (!customSize) {
      return size as T;
    }
    if (typeof customSize === "string") {
      return customSize ?? size;
    }
    if (typeof customSize === "function") {
      return customSize(size);
    }
    return size as T;
  }, [customSize, size]);
  return mergedSize;
};

export default useSize;
