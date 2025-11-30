/* eslint-disable @typescript-eslint/no-unnecessary-condition */
// https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useResponsive/index.ts
// May 27, 2024
"use client";

import { useEffect, useState } from "react";

import { isBrowser } from "@acme/ui/lib/utils";

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type ResponsiveInfo = Record<Breakpoint, boolean>;

let info: ResponsiveInfo = {
  xs: false,
  sm: false,
  md: false,
  lg: false,
  xl: false,
  xxl: false,
};

const tailwindScreensConfig = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  xxl: "1536px",
};
let responsiveConfig = (() => {
  const c: Record<string, number> = {};
  Object.keys(tailwindScreensConfig).map((x) => {
    c[x] = Number(
      tailwindScreensConfig[x as keyof typeof tailwindScreensConfig]?.replace(
        "px",
        "",
      ),
    );
  });
  return {
    xs: 0,
    ...c,
  };
})() as Record<Breakpoint, number>;
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
  for (const key of Object.keys(responsiveConfig) as Breakpoint[]) {
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

export const useResponsive = () => {
  const [state, setState] = useState<ResponsiveInfo>(info);

  useEffect(() => {
    if (!isBrowser) return;

    // Initialize info and calculate initial values
    if (!listening) {
      calculate();
      window.addEventListener("resize", handleResize);
      listening = true;
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
};
