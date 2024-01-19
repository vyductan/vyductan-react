"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { clsm } from "@vyductan/utils";

import { Spin } from "../spin";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center text-sm font-medium ring-offset-white transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
  ],
  {
    variants: {
      color: {
        default: [],
        danger: [
          "bg-red-500",
          "hover:bg-red-500/90",
          "active:ring-red-200",
          "dark:bg-red-900",
          "dark:hover:bg-red-900/90",
        ],
      },
      variant: {
        primary: [
          "bg-primary text-white",
          "hover:bg-primary-hover",
          "active:ring-primary",
        ],
        default: [
          // "text-primary",
          "border border-border",
          "hover:border-primary-hover hover:text-primary-hover",
        ],
        dashed: [
          "border border-dashed border-border",
          "hover:border-primary-hover hover:text-primary-hover",
        ],
        // default: [
        //   "bg-gray-900 text-gray-50",
        //   "hover:bg-gray-900/90",
        //   "dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90",
        // ],

        // secondary:
        // "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
        "ghost-action": ["text-blue-500"],
        "ghost-danger": [
          "text-red-500",
          "hover:bg-red-500/90 hover:text-gray-50",
          "dark:text-red-600",
          "dark:hover:bg-red-900/90 dark:hover:text-gray-50",
        ],
        link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
      },
      size: {
        xs: "h-xs rounded-xs px-2 py-0",
        sm: "h-sm rounded-sm px-3 py-1",
        default: "h-md rounded-md px-4 py-2",
        lg: "h-lg rounded-sm px-3 py-1 text-md",
        xl: "h-xl px-4 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  href?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      color,
      disabled,
      loading,
      size,
      variant,
      icon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={clsm(
          buttonVariants({ color, variant, size, className }),
          icon && !children
            ? !size || size === "default"
              ? "w-10"
              : size === "sm"
                ? "w-8"
                : size === "xs"
                  ? "w-6"
                  : ""
            : "",
        )}
        disabled={loading ?? disabled}
        {...props}
      >
        {icon && <span className={clsm(children && "mr-2")}>{icon}</span>}
        {loading ? <Spin>{children}</Spin> : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
