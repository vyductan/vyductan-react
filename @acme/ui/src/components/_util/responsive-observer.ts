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
type SubscribeFunction = (screens: ScreenMap) => void;

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
  subscribe: (function_: SubscribeFunction) => number;
  unsubscribe: (token: number) => void;
  register: () => void;
  unregister: () => void;
  matchHandlers: Record<
    PropertyKey,
    {
      mql: MediaQueryList;
      listener: (this: MediaQueryList, event: MediaQueryListEvent) => void;
    }
  >;
}

const useResponsiveObserver = () => {
  const subscribersReference = React.useRef(
    new Map<number, SubscribeFunction>(),
  );
  const subUidReference = React.useRef(-1);
  const screensReference = React.useRef<ScreenMap>({});

  // To avoid repeat create instance, we add `useMemo` here.
  return React.useMemo<ResponsiveObserverType>(() => {
    const subscribers = subscribersReference.current;
    return {
      responsiveMap,
      matchHandlers: {},
      dispatch(pointMap: ScreenMap) {
        screensReference.current = pointMap;
        subscribers.forEach((function_) => function_(screensReference.current));
        return subscribers.size > 0;
      },
      subscribe(function_: SubscribeFunction): number {
        if (subscribers.size === 0) {
          this.register();
        }
        subUidReference.current += 1;
        subscribers.set(subUidReference.current, function_);
        function_(screensReference.current);
        return subUidReference.current;
      },
      unsubscribe(parameterToken: number) {
        subscribers.delete(parameterToken);
        if (subscribers.size === 0) {
          this.unregister();
        }
      },
      register() {
        for (const [screen, mediaQuery] of Object.entries(responsiveMap)) {
          const listener = ({ matches }: { matches: boolean }) => {
            this.dispatch({ ...screensReference.current, [screen]: matches });
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
