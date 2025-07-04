/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable unicorn/no-for-loop */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable unicorn/no-array-for-each */
import type { Breakpoint, ScreenMap } from "../../_util/responsive-observer";
import type { RowProps } from "../row";
import { responsiveArray } from "../../_util/responsive-observer";

type Gap = number | undefined;

export default function useGutter(
  gutter: RowProps["gutter"],
  screens: ScreenMap | null,
): [Gap, Gap] {
  const results: [number | undefined, number | undefined] = [
    undefined,
    undefined,
  ];
  const normalizedGutter = Array.isArray(gutter) ? gutter : [gutter, undefined];

  // By default use as `xs`
  const mergedScreens = screens || {
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    xxl: true,
  };

  normalizedGutter.forEach((g, index) => {
    if (typeof g === "object" && g !== null) {
      for (let i = 0; i < responsiveArray.length; i++) {
        const breakpoint: Breakpoint = responsiveArray[i]!;
        if (mergedScreens[breakpoint] && g[breakpoint] !== undefined) {
          results[index] = g[breakpoint] as number;
          break;
        }
      }
    } else {
      results[index] = g;
    }
  });
  return results;
}
