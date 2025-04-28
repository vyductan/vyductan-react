"use client";

import React from "react";

import type { FloatButtonProps } from "./float-button";

const FloatButtonGroupContext = React.createContext<
  FloatButtonProps["shape"] | undefined
>(undefined);

export const { Provider: FloatButtonGroupProvider } = FloatButtonGroupContext;

export default FloatButtonGroupContext;
