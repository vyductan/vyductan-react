import { useEffect, useState } from "react";
import { theme } from "tailwindcss/defaultConfig";

import isBrowser from "../utils/isBrowser";

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();

type Screens = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type ResponsiveInfo = Record<Screens, boolean>;

let info: ResponsiveInfo;

const tailwindScreensConfig = theme?.screens as Record<string, string>;

let responsiveConfig = (() => {
  const c: Record<string, number> = {};
  Object.keys(tailwindScreensConfig).map((x) => {
    c[x] = Number(tailwindScreensConfig[x]!.replace("px", ""));
  });
  return {
    xs: 0,
    ...c,
  };
})() as Record<Screens, number>;
type ResponsiveConfig = typeof responsiveConfig;

function handleResize() {
  const oldInfo = info;
  calculate();
  if (oldInfo === info) return;
  for (const subscriber of subscribers) {
    subscriber();
  }
}

let listening = false;

function calculate() {
  const width = window.innerWidth;
  const newInfo = {} as ResponsiveInfo;
  let shouldUpdate = false;
  for (const key of Object.keys(responsiveConfig) as Screens[]) {
    newInfo[key] = width >= responsiveConfig[key];
    if (newInfo[key] !== info[key]) {
      shouldUpdate = true;
    }
  }
  if (shouldUpdate) {
    info = newInfo;
  }
}

export function configResponsive(config: ResponsiveConfig) {
  responsiveConfig = config;
  if (info) calculate();
}

export default function useResponsive() {
  if (isBrowser && !listening) {
    info = {
      xs: false,
      sm: false,
      md: false,
      lg: false,
      xl: false,
      "2xl": false,
    };
    calculate();
    window.addEventListener("resize", handleResize);
    listening = true;
  }
  const [state, setState] = useState<ResponsiveInfo>(info);

  useEffect(() => {
    if (!isBrowser) return;

    // In React 18's StrictMode, useEffect perform twice, resize listener is remove, so handleResize is never perform.
    // https://github.com/alibaba/hooks/issues/1910
    if (!listening) {
      window.addEventListener("resize", handleResize);
    }

    const subscriber = () => {
      setState(info);
    };

    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        window.removeEventListener("resize", handleResize);
        listening = false;
      }
    };
  }, []);

  return state;
}
