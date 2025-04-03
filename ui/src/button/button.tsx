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
import { useUiConfig } from "../store";
import { LoadingIcon } from "./loading-icon";

const buttonVariants = tv({
  base: [
    "inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap ring-offset-white transition-all outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    // "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", // moved to &_span
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    // own
    // "shrink-0", // disable flex box sizing - added by shadcn
    "[&_span[role='img']]:pointer-events-none [&_span[role='img']]:shrink-0 [&_span[role='img']:not([class*='size-'])]:size-4",
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
      danger: [],
      link: [],
      success: [],
      gray: [],
      red: [],
      orange: [],
      amber: [],
      yellow: [],
      lime: [],
      green: [],
      emerald: [],
      teal: [],
      cyan: [],
      sky: [],
      blue: [],
      indigo: [],
      violet: [],
      purple: [],
      fuchsia: [],
      pink: [],
      rose: [],
    },
    size: {
      sm: "h-6 gap-1.5 rounded-sm px-2 py-0 font-normal",
      default: "h-8 rounded-md px-3 py-1 has-[>svg]:px-2.5",
      lg: "h-10 rounded-lg px-4 py-2 has-[>svg]:px-4",
      xl: "h-12 rounded-lg px-4 py-2.5 text-lg",
    },
    variant: {
      default: [
        "border-primary-500 bg-primary-500 text-primary-foreground shadow-xs",
        "hover:border-primary-600 hover:bg-primary-600",
        "active:ring-primary",
      ],
      solid: ["text-white"],
      outline: [
        "border-input bg-background hover:text-accent-foreground hover:bg-accent dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs",
      ],
      dashed: [
        "border-border border border-dashed",
        "hover:border-primary-600 hover:text-primary-600",
      ],
      filled: [],
      ghost: [
        "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      ],
      light: ["border-transparent", "hover:bg-background-hover"],
      link: [
        "text-primary underline-offset-4 hover:underline",
        // "h-auto gap-1 border-0 p-0 font-normal",
      ],
      text: "border-0 px-0",
    },
    shape: {
      default: "",
      icon: [
        'sm:has-[span[class*="sm::not-sr-only"]]:w-auto',
        'max-sm:has-[span[class*="sm::not-sr-only"]]:p-0',
        '[&:not(:has(span[class*="sm::not-sr-only"]))]:p-0',
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
        "border-red-500 bg-red-500",
        "hover:border-red-600 hover:bg-red-600",
      ],
    },
    {
      primary: true,
      color: "amber",
      className: [
        "border-amber-500 bg-amber-500",
        "hover:border-amber-600 hover:bg-amber-600",
      ],
    },
    {
      primary: true,
      color: "gray",
      className: [
        "border-gray-500 bg-gray-500",
        "hover:border-gray-600 hover:bg-gray-600",
      ],
    },
    {
      primary: true,
      color: "green",
      className: [
        "border-green-500 bg-green-500",
        "hover:border-green-600 hover:bg-green-600",
      ],
    },
    {
      primary: true,
      color: "teal",
      className: [
        "border-teal-500 bg-teal-500",
        "hover:border-teal-600 hover:bg-teal-600",
      ],
    },
    {
      primary: true,
      color: "pink",
      className: [
        "border-pink-500 bg-pink-500",
        "hover:border-pink-600 hover:bg-pink-600",
      ],
    },
    {
      variant: "solid",
      color: "green",
      className: [
        "border-green-600 bg-green-600",
        "hover:border-green-700 hover:bg-green-700",
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
    {
      variant: "outline",
      color: "link",
      className: ["text-link", "hover:bg-link-hover hover:text-white"],
    },
    {
      variant: "outline",
      color: "green",
      className: [
        "border-green-600 text-green-600",
        "hover:border-green-700 hover:text-green-700",
      ],
    },
    // filled
    {
      variant: "filled",
      color: "green",
      className: [
        "bg-green-100 text-green-600",
        "hover:bg-green-200 hover:text-green-700",
      ],
    },
    // light
    {
      variant: "light",
      className: ["bg-gray-100 text-gray-950", "hover:bg-gray-200"],
    },
    {
      variant: "light",
      primary: true,
      className: [
        "bg-primary-200 text-primary-500",
        "hover:bg-primary-600 hover:text-white",
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
        "border-primary text-primary bg-transparent",
        "hover:bg-primary-active hover:border-primary-hover hover:text-primary-hover",
        "hover:bg-blue-100 dark:hover:bg-blue-300",
      ],
    },
    // Ghost
    {
      variant: "ghost",
      color: "danger",
      className: ["text-error", "hover:text-error-hover", "hover:bg-red-100"],
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
      className: ["text-link", "hover:text-link-hover", "hover:bg-blue-100"],
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
  color?: ButtonVariants["color"];
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
    const buttonConfig = useUiConfig((state) => state.components.button);

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
      <Wave component="Button" disabled={loading}>
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
