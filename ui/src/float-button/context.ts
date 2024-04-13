"use client";

import React from "react";

import type { FloatButtonProps } from "./FloatButton";

const FloatButtonGroupContext = React.createContext<
  FloatButtonProps["shape"] | undefined
>(undefined);

export const { Provider: FloatButtonGroupProvider } = FloatButtonGroupContext;

export default FloatButtonGroupContext;
