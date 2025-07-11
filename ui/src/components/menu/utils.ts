/* eslint-disable unicorn/prefer-global-this */
/* eslint-disable unicorn/no-negated-condition */
import * as React from "react";

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
