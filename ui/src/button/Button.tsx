"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { clsm } from "..";
import Wave from "../_util/wave";
import { LoadingIcon } from "./LoadingIcon";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-colors",
    "border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
    "dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
  ],
  {
    variants: {
      primary: {
        true: ["border-primary", "hover:border-primary-hover "],
      },
      action: {
        true: [],
      },
      danger: {
        true: ["text-error", "active:ring-error-active"],
      },
      color: {
        default: [],
        action: [],
        danger: [],
      },
      variant: {
        default: [
          "bg-primary text-white",
          "hover:bg-primary-hover hover:text-white",
          "active:ring-primary",
        ],
        outline: [
          "border-border bg-background",
          "hover:border-border-hover hover:bg-background-hover",
        ],
        dashed: [
          "border border-dashed border-border",
          "hover:border-primary-hover hover:text-primary-hover",
        ],
        ghost: ["border-transparent", "hover:bg-gray-100 hover:text-gray-900"],
        light: ["border-transparent", "hover:bg-gray-100 hover:text-gray-900"],
        link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
      },
      size: {
        sm: "h-6 rounded-sm px-2 py-0",
        default: "h-8 rounded-md px-3 py-1",
        lg: "h-10 rounded-lg px-4 py-2",
      },
      shape: {
        default: "",
        icon: "p-0",
        circle: "rounded-full",
      },
      disabled: {
        true: "pointer-events-none opacity-50",
        false: "",
      },
    },
    compoundVariants: [
      {
        primary: true,
        danger: true,
        className: [
          "border-error bg-error",
          "hover:border-error-hover hover:bg-error-hover",
        ],
      },
      {
        variant: "light",
        color: "action",
        className: ["text-info bg-info/10", "hover:text-white hover:bg-info"],
      },
      {
        variant: "light",
        color: "danger",
        className: [
          "text-danger bg-danger/10",
          "hover:text-white hover:bg-danger",
        ],
      },
      {
        primary: true,
        variant: "outline",
        className: [
          "border-primary bg-transparent text-primary",
          "hover:bg-primary-active hover:border-primary-hover hover:text-primary-hover",
          "hover:bg-blue-100 dark:hover:bg-blue-300",
        ],
      },
      {
        danger: true,
        variant: "outline",
        className: [
          "border-error",
          "hover:border-error-hover  hover:text-error-hover",
          "hover:bg-red-100 dark:hover:bg-red-300",
        ],
      },
      {
        size: "sm",
        shape: ["icon", "circle"],
        className: "w-6",
      },
      {
        size: "default",
        shape: ["icon", "circle"],
        className: "min-w-8 w-8",
      },
      {
        size: "lg",
        shape: ["icon", "circle"],
        className: "w-10",
      },
      {
        size: "lg",
        shape: ["icon", "circle"],
        className: "w-12",
      },
    ],
    defaultVariants: {
      variant: "default",
      color: "default",
      size: "default",
      shape: "default",
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    Omit<ButtonVariants, "color" | "disabled" | "variant"> {
  asChild?: boolean;
  href?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  color?: NonNullable<ButtonVariants["color"]>;
  variant?: Exclude<ButtonVariants["variant"], "primary">;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      color,
      danger,
      disabled,
      loading,
      primary,
      size,
      shape,
      variant,
      icon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Wave>
        <Comp
          ref={ref}
          className={clsm(
            "relative",
            buttonVariants({
              color,
              danger,
              disabled,
              primary: !primary && !!variant ? null : !primary ? true : primary,
              size,
              shape: icon && !children ? shape ?? "icon" : shape,
              variant,
              className,
            }),
          )}
          disabled={loading ?? disabled}
          {...props}
        >
          {asChild ? (
            children
          ) : (
            <>
              {(!!loading || icon) && (
                <span className={clsm(children ? "mr-2" : "")}>
                  <Slot className="size-5">
                    {loading ? <LoadingIcon /> : icon}
                  </Slot>
                </span>
              )}
              {children}
            </>
          )}
        </Comp>
      </Wave>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
