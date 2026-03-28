/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable unicorn/no-array-for-each */

import React from "react";

import {
  addMediaQueryListener,
  removeMediaQueryListener,
} from "./media-query-util";

export type Breakpoint = "xxl" | "xl" | "lg" | "md" | "sm" | "xs";
export type BreakpointMap = Record<Breakpoint, string>;
export type ScreenMap = Partial<Record<Breakpoint, boolean>>;
export type ScreenSizeMap = Partial<Record<Breakpoint, number>>;

export const responsiveArray: Breakpoint[] = [
  "xxl",
  "xl",
  "lg",
  "md",
  "sm",
  "xs",
];
type SubscribeFunc = (screens: ScreenMap) => void;

const responsiveMap: BreakpointMap = {
  xs: "(max-width: 575px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
  xxl: "(min-width: 1600px)",
};

export const matchScreen = (
  screens: ScreenMap,
  screenSizes?: ScreenSizeMap,
) => {
  if (!screenSizes) {
    return;
  }
  for (const breakpoint of responsiveArray) {
    if (screens[breakpoint] && screenSizes?.[breakpoint] !== undefined) {
      return screenSizes[breakpoint];
    }
  }
};

interface ResponsiveObserverType {
  responsiveMap: BreakpointMap;
  dispatch: (map: ScreenMap) => boolean;
  subscribe: (func: SubscribeFunc) => number;
  unsubscribe: (token: number) => void;
  register: () => void;
  unregister: () => void;
  matchHandlers: Record<
    PropertyKey,
    {
      mql: MediaQueryList;
      listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void;
    }
  >;
}

const useResponsiveObserver = () => {
  // To avoid repeat create instance, we add `useMemo` here.
  return React.useMemo<ResponsiveObserverType>(() => {
    const subscribers = new Map<number, SubscribeFunc>();
    let subUid = -1;
    let screens: Partial<Record<Breakpoint, boolean>> = {};
    return {
      responsiveMap,
      matchHandlers: {},
      dispatch(pointMap: ScreenMap) {
        screens = pointMap;
        subscribers.forEach((func) => func(screens));
        return subscribers.size > 0;
      },
      subscribe(func: SubscribeFunc): number {
        if (subscribers.size === 0) {
          this.register();
        }
        subUid += 1;
        subscribers.set(subUid, func);
        func(screens);
        return subUid;
      },
      unsubscribe(paramToken: number) {
        subscribers.delete(paramToken);
        if (subscribers.size === 0) {
          this.unregister();
        }
      },
      register() {
        for (const [screen, mediaQuery] of Object.entries(responsiveMap)) {
          const listener = ({ matches }: { matches: boolean }) => {
            this.dispatch({ ...screens, [screen]: matches });
          };
          const mql = globalThis.matchMedia(mediaQuery);
          addMediaQueryListener(mql, listener);
          this.matchHandlers[mediaQuery] = { mql, listener };
          listener(mql);
        }
      },
      unregister() {
        Object.values(responsiveMap).forEach((mediaQuery) => {
          const handler = this.matchHandlers[mediaQuery]!;
          removeMediaQueryListener(handler?.mql, handler?.listener);
        });
        subscribers.clear();
      },
    };
  }, []);
};

export default useResponsiveObserver;
