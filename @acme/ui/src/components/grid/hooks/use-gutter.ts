/* eslint-disable unicorn/no-for-loop */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable unicorn/no-array-for-each */
import type { Breakpoint, ScreenMap } from "../../_util/responsive-observer";
import type { RowProps as RowProperties } from "../row";
import { responsiveArray } from "../../_util/responsive-observer";

type Gap = number | undefined;

export default function useGutter(
  gutter: RowProperties["gutter"],
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
      for (let index_ = 0; index_ < responsiveArray.length; index_++) {
        const breakpoint: Breakpoint = responsiveArray[index_]!;
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
