"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import type { IconProps } from "../icons";
import { clsm } from "..";
import Wave from "../_util/wave";
import { GenericSlot } from "../slot";
import { LoadingIcon } from "./LoadingIcon";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-white transition-colors",
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
      color: {
        default: [],
        accent: [],
        danger: [],
        success: [],
      },
      variant: {
        default: [
          "bg-primary text-white",
          "hover:bg-primary-hover hover:text-white",
          "active:ring-primary",
        ],
        outline: [
          "border-border",
          "hover:border-border-hover hover:bg-background-hover",
        ],
        dashed: [
          "border border-dashed border-border",
          "hover:border-primary-hover hover:text-primary-hover",
        ],
        ghost: [
          "border-transparent",
          "hover:bg-background-hover",
          "data-[state=open]:bg-background-hover",
        ],
        light: ["border-transparent", "hover:bg-background-hover"],
        link: "underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-6 rounded-sm px-2 py-0 font-normal",
        default: "h-8 rounded-md px-3 py-1",
        lg: "h-10 rounded-lg px-4 py-2",
      },
      shape: {
        default: "",
        icon: [
          // "p-0 ",
          // "sm:[&:has(span.sm:not-sr-only)]:w-auto [&:not(:has(span.sm\\:not-sr-only))]:p-0",
          // '[&:has(span[class*="sm:not-sr-only"])]:w-auto [&:not(:has(span.sm\\:not-sr-only))]:p-0',
          // "sm:[&:has(span.size-4)]:w-auto [&:not(:has(span.sm\\:not-sr-only))]:p-0",
          // "sm:has-[span.size-4]:w-auto [&:not(:has(span.sm\\:not-sr-only))]:p-0",
          // "has-[span.sm\\:not-sr-only]:w-auto [&:not(:has(span.sm\\:not-sr-only))]:p-0",
          // "has-[span.sm\\:not-sr-only]:w-auto",
          // 'has-[span[class*="sm:not-sr-only"]]:sm:w-auto [&:not(:has(span.sm\\:not-sr-only))]:p-0',
          // '[&:has(span[class*="sm:not-sr-only"])]:sm:w-auto [&:not(:has(span.sm\\:not-sr-only))]:p-0',
          // "!p-[unset]",
          // 'has-[span[class*="sm:not-sr-only"]]:sm:w-auto has-[span[class*="sm:not-sr-only"]]:p-0 has-[span[class*="sm:not-sr-only"]]:sm:p-[auto]',
          'has-[span[class*="sm:not-sr-only"]]:sm:w-auto',
          'has-[span[class*="sm:not-sr-only"]]:max-sm:p-0',
          '[&:not(:has(span[class*="sm:not-sr-only"]))]:p-0',
        ],
        circle: "rounded-full",
      },
      /* Whenever to hidden text at mobile view */
      srOnly: {
        true: "",
        false: "",
      },
      disabled: {
        true: "pointer-events-none opacity-50",
        false: "",
      },
    },
    compoundVariants: [
      // primary
      {
        primary: true,
        // danger: true,
        color: "danger",
        className: [
          "border-error bg-error",
          "hover:border-error-hover hover:bg-error-hover",
        ],
      },

      // light
      {
        variant: "light",
        className: [
          "bg-gray-200 text-gray-950",
          "hover:bg-gray-700 hover:text-white",
        ],
      },
      {
        variant: "light",
        primary: true,
        className: [
          "bg-primary-300 text-primary-600",
          "hover:bg-primary-700 hover:text-white",
        ],
      },
      {
        variant: "light",
        color: "accent",
        className: [
          "bg-accent-muted text-accent",
          // "hover:text-white hover:bg-info",
          "hover:bg-accent-hover hover:text-white",
        ],
      },
      {
        variant: "light",
        color: "danger",
        className: [
          "bg-error-muted text-error",
          "hover:bg-error-hover hover:text-white",
        ],
      },
      {
        variant: "light",
        color: "success",
        className: [
          "bg-success/10 text-success",
          "hover:bg-success hover:text-white",
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
      // outline
      {
        variant: "outline",
        color: "danger",
        className: [
          "border-error",
          "hover:border-error-hover hover:text-error-hover",
          "hover:bg-red-100 dark:hover:bg-red-300",
        ],
      },
      // Ghost
      {
        variant: "ghost",
        color: "danger",
        className: [
          "text-error",
          "hover:text-error-hover",
          "hover:bg-red-100 dark:hover:bg-red-300",
        ],
      },
      {
        variant: "ghost",
        color: "success",
        className: [
          "text-success",
          "hover:text-success-hover",
          "hover:bg-green-100",
        ],
      },
      // Size
      {
        size: "sm",
        shape: ["icon", "circle"],
        className: "w-6",
      },
      {
        size: "default",
        shape: ["icon", "circle"],
        className: "w-8",
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
  // icon?: React.ReactElement<IconProps>;
  color?: NonNullable<ButtonVariants["color"]>;
  variant?: Exclude<ButtonVariants["variant"], "primary">;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      href,
      children,
      className,
      color,
      disabled,
      loading,
      primary,
      size,
      shape,
      srOnly,
      variant,
      icon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild || href ? Slot : "button";

    const ChildrenToRender = (
      <>
        {(!!loading || icon) && (
          <GenericSlot<Partial<IconProps>>
            className={clsm(
              size === "sm" ? "" : "size-4",
              // children ? "mr-2" : "",
            )}
            // srOnly={
            //   srOnly && typeof children === "string"
            //     ? children
            //     : undefined
            // }
          >
            {loading ? <LoadingIcon /> : icon}
          </GenericSlot>
        )}
        {srOnly && typeof children === "string" ? (
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {children}
          </span>
        ) : (
          children
        )}
      </>
    );

    return (
      <Wave>
        <Comp
          ref={ref}
          className={clsm(
            "relative",
            buttonVariants({
              color,
              disabled,
              primary: !primary && !!variant ? null : !primary ? true : primary,
              size,
              shape: (icon && !children) || srOnly ? (shape ?? "icon") : shape,
              // shape:
              //   (icon && !children) || icon?.props.srOnly
              //     ? (shape ?? "icon")
              //     : shape,
              variant,
              className,
            }),
          )}
          disabled={loading ?? disabled}
          type="button"
          {...props}
        >
          {asChild ? (
            children
          ) : href ? (
            <Link href={href}>{ChildrenToRender}</Link>
          ) : (
            ChildrenToRender
          )}
        </Comp>
      </Wave>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
