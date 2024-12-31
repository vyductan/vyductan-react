"use client";

import type { VariantProps } from "tailwind-variants";
import type { PartialDeep } from "type-fest";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { tv } from "tailwind-variants";

import type { IconProps } from "../icons";
import { cn } from "..";
import Wave from "../_util/wave";
import { Link } from "../link";
import { GenericSlot } from "../slot";
import { useUi } from "../store";
import { LoadingIcon } from "./loading-icon";

const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-white transition-colors",
    "border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
    "dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
  ],
  variants: {
    primary: {
      true: ["border-primary", "hover:border-primary-hover"],
    },
    action: {
      true: [],
    },
    color: {
      default: [],
      link: [],
      danger: [],
      success: [],
      amber: [],
      green: [],
      gray: [],
      teal: [],
      pink: [],
    },
    size: {
      sm: "h-6 rounded-sm px-2 py-0 font-normal",
      default: "h-8 rounded-md px-3 py-1",
      lg: "h-10 rounded-lg px-4 py-2",
      xl: "h-12 rounded-lg px-4 py-2.5 text-lg",
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
      link: "h-auto gap-1 border-0 p-0 font-normal underline-offset-2 hover:underline",
      text: "border-0 px-0",
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
    {
      primary: true,
      color: "amber",
      className: [
        "border-amber-600 bg-amber-600",
        "hover:border-amber-700 hover:bg-amber-700",
      ],
    },
    {
      primary: true,
      color: "gray",
      className: [
        "border-gray-600 bg-gray-600",
        "hover:border-gray-700 hover:bg-gray-700",
      ],
    },
    {
      primary: true,
      color: "green",
      className: [
        "border-green-600 bg-green-600",
        "hover:border-green-700 hover:bg-green-700",
      ],
    },
    {
      primary: true,
      color: "teal",
      className: [
        "border-teal-600 bg-teal-600",
        "hover:border-teal-700 hover:bg-teal-700",
      ],
    },
    {
      primary: true,
      color: "pink",
      className: [
        "border-pink-600 bg-pink-600",
        "hover:border-pink-700 hover:bg-pink-700",
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
      color: "link",
      className: [
        "bg-link-muted text-link",
        // "hover:text-white hover:bg-info",
        "hover:bg-link-hover hover:text-white",
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
    {
      variant: "ghost",
      color: "link",
      className: ["text-link", "hover:text-link-hover", "hover:bg-link-muted"],
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
      className: "size-8",
    },
    {
      size: "lg",
      shape: ["icon", "circle"],
      className: "w-10",
    },
    {
      size: "xl",
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
});

type TypeWithGeneric<T> = T[];
type ExtractGeneric<Type> = Type extends TypeWithGeneric<infer X> ? X : never;

type ExtractedTVButtonOptions = ExtractGeneric<
  TypeWithGeneric<typeof buttonVariants>
>;

type TVButtonOptions = PartialDeep<Partial<ExtractedTVButtonOptions>>;

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
  classNames?: {
    variants?: TVButtonOptions;
  };
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
    const buttonConfig = useUi((state) => state.componentConfig.button);

    const Comp = asChild || href ? Slot : "button";

    const ChildrenToRender = (
      <>
        {(!!loading || icon) && (
          <GenericSlot<Partial<IconProps>>
            className={cn(
              "size-4",
              size === "sm" && "size-4",
              size === "lg" && "size-4",
              size === "xl" && "size-[18px]",
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
          className={cn(
            "relative",
            buttonVariants({
              color,
              disabled,
              primary: !primary && !!variant ? undefined : (primary ?? true),
              size,
              shape: (icon && !children) || srOnly ? (shape ?? "icon") : shape,
              variant,
            }),
            buttonConfig?.classNames?.variants &&
              tv(
                buttonConfig.classNames
                  .variants as unknown as ExtractedTVButtonOptions,
              )({
                color,
                disabled,
                primary: !primary && !!variant ? undefined : (primary ?? true),
                size,
                shape:
                  (icon && !children) || srOnly ? (shape ?? "icon") : shape,
                variant,
              }),
            className,
          )}
          disabled={loading ?? disabled}
          aria-disabled={loading ?? disabled}
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

export type { ButtonVariants };

export { Button, buttonVariants };

export { LoadingIcon } from "./loading-icon";
