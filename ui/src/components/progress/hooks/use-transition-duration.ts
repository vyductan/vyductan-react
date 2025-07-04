/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable unicorn/no-array-for-each */
import { useEffect, useRef } from "react";

import type { ProgressProps } from "../progress";

export const defaultProps: Partial<ProgressProps> = {
  percent: 0,
  strokeColor: "#2db7f5",
  strokeLinecap: "round",
  strokeWidth: 1,
  trailColor: "#D9D9D9",
  trailWidth: 1,
  gapPosition: "bottom",
  loading: false,
};

export const useTransitionDuration = (): SVGPathElement[] => {
  const pathsRef = useRef<SVGPathElement[]>([]);
  const prevTimeStamp = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    let updated = false;

    pathsRef.current.forEach((path) => {
      if (!path) {
        return;
      }

      updated = true;
      const pathStyle = path.style;
      pathStyle.transitionDuration = ".3s, .3s, .3s, .06s";

      if (prevTimeStamp.current && now - prevTimeStamp.current < 100) {
        pathStyle.transitionDuration = "0s, 0s";
      }
    });

    if (updated) {
      prevTimeStamp.current = Date.now();
    }
  });

  return pathsRef.current;
};
