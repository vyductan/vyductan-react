/* eslint-disable react-hooks/refs */

import { useEffect, useRef } from "react";

import type { ProgressProps as ProgressProperties } from "../progress";

export const defaultProps: Partial<ProgressProperties> = {
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
  const pathsReference = useRef<SVGPathElement[]>([]);
  const previousTimeStamp = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    let updated = false;

    pathsReference.current.forEach((path) => {
      if (!path) {
        return;
      }

      updated = true;
      const pathStyle = path.style;
      pathStyle.transitionDuration = ".3s, .3s, .3s, .06s";

      if (previousTimeStamp.current && now - previousTimeStamp.current < 100) {
        pathStyle.transitionDuration = "0s, 0s";
      }
    });

    if (updated) {
      previousTimeStamp.current = Date.now();
    }
  });

  return pathsReference.current;
};
