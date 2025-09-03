"use client";

import type { VariantProps } from "tailwind-variants";
import type { PartialDeep } from "type-fest";
import * as React from "react";
import { useUiConfig } from "@/components/ui/config-provider";
import { Slot } from "@radix-ui/react-slot";
import { tv } from "tailwind-variants";

import type { IconProps } from "@acme/ui/icons";
import { GenericSlot } from "@acme/ui/components/slot";
import { cn } from "@acme/ui/lib/utils";

import Wave from "../../lib/wave";
import { Link } from "../link";
import { LoadingIcon } from "./loading-icon";

const buttonVariants = tv({
  base: [
    "inline-flex shrink-0 items-center justify-center gap-2 border text-sm font-medium whitespace-nowrap ring-offset-white transition-all outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    // "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", // moved to &_span
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    // own
    // "shrink-0", // disable flex box sizing - added by shadcn
    "[&_span[role='img']]:pointer-events-none [&_span[role='img']]:shrink-0 [&_span[role='img']:not([class*='size-'])]:size-4",
  ],
  variants: {
    type: {
      default: [],
      primary: ["border-primary", "hover:border-primary-hover"],
      dashed: ["border-dashed"],
      link: ["border-transparent"],
      text: ["border-0"],
    },
    primary: {
      true: ["border-primary", "hover:border-primary-hover"],
    },
    action: {
      true: [],
    },
    color: {
      default: [],
      primary: ["text-primary", "hover:text-primary-700"],
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
      small: "h-6 gap-1.5 rounded-sm px-2 py-0 font-normal",
      middle: "h-8 rounded-md px-[15px] has-[>svg]:px-2.5",
      large: "h-10 rounded-lg px-4 py-2 has-[>svg]:px-4",
      // sm: "h-6 gap-1.5 rounded-sm px-2 py-0 font-normal",
      // lg: "h-10 rounded-lg px-4 py-2 has-[>svg]:px-4",
      // xl: "h-12 rounded-lg px-4 py-2.5 text-lg",
      default: "h-8 rounded-md px-[15px] has-[>svg]:px-2.5",
      icon: "size-9",
    },
    variant: {
      default: [
        "border-primary-500 bg-primary-500 text-primary-foreground shadow-xs",
        "hover:border-primary-600 hover:bg-primary-600",
        "active:ring-primary",
      ],
      destructive:
        "border-red-600 bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-600/20 active:bg-red-800 dark:focus-visible:ring-red-600/40",
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
        "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-none",
      ],
      light: ["border-transparent", "hover:bg-background-hover"],
      link: ["border-0"],
      text: "border-0",
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
      color: "danger",
      className: [
        "border-red-600 bg-red-600 text-white",
        "hover:border-red-700 hover:bg-red-700",
        "active:border-red-800 active:bg-red-800",
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
      variant: "default",
      color: "default",
      className: [
        "border-primary-500 bg-primary-500 text-primary-foreground shadow-xs",
        "hover:border-primary-600 hover:bg-primary-600",
        "active:ring-primary",
      ],
    },
    {
      variant: "default",
      color: "danger",
      className: [
        "border-red-600 bg-red-600 text-white shadow-xs",
        "hover:border-red-700 hover:bg-red-700",
        "active:border-red-800 active:bg-red-800",
      ],
    },
    {
      variant: "default",
      color: "link",
      className: ["border-link bg-link text-white", "hover:bg-link-hover"],
    },
    {
      variant: "default",
      color: "success",
      className: [
        "border-green-600 bg-green-600",
        "hover:border-green-700 hover:bg-green-700",
      ],
    },
    {
      variant: "outline",
      color: "danger",
      className: [
        "border-red-600 bg-white text-red-600",
        "hover:border-red-500 hover:bg-red-50 hover:text-red-500",
        "active:border-red-700 active:text-red-700",
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
      color: "primary",
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
        "bg-red-50 text-red-600",
        "hover:bg-red-100 hover:text-red-700",
        "active:bg-red-200 active:text-red-800",
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
    // Link
    {
      variant: "link",
      color: "default",
      className: ["", "hover:text-primary"],
    },
    // Size
    {
      size: "small",
      shape: ["icon", "circle"],
      className: "w-6",
    },
    {
      size: "middle",
      shape: ["icon", "circle"],
      className: "size-8",
    },
    {
      size: "large",
      shape: ["icon", "circle"],
      className: "w-10",
    },
  ],
  defaultVariants: {
    variant: "default",
    color: "default",
    size: "middle",
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

type HtmlType = React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
type ButtonType = ButtonVariants["type"];

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "color">,
    Omit<ButtonVariants, "type" | "color" | "disabled" | "variant" | "size"> {
  type?: HtmlType | ButtonType;
  htmlType?: HtmlType;
  htmlColor?: React.CSSProperties["color"];
  asChild?: boolean;
  href?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  color?: ButtonVariants["color"];
  variant?: Exclude<ButtonVariants["variant"], "primary">;
  classNames?: {
    variants?: TVButtonOptions;
  };
  size?: ButtonVariants["size"] | "sm";
  danger?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      href,
      children,
      className,
      color = "default",
      disabled,
      loading,
      primary,
      size,
      shape,
      srOnly,
      variant,
      icon,
      type,
      htmlType,
      htmlColor,
      danger,
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
            className={cn("size-4")}
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

    const isHtmlType =
      type === "submit" || type === "reset" || type === "button";
    const htmlTypeToPass = isHtmlType ? type : (htmlType ?? "button");

    let variantToPass = variant;
    if (!isHtmlType && type === "text") {
      variantToPass = "ghost";
    }

    let sizeToPass = size as ButtonVariants["size"];
    if (size === "sm") {
      sizeToPass = "small";
    }

    return (
      <Wave component="Button" disabled={loading}>
        <Comp
          ref={ref}
          className={cn(
            "relative",
            buttonVariants({
              color: danger ? "danger" : color,
              disabled,
              primary: !primary && !!variant ? undefined : (primary ?? true),
              size: sizeToPass,
              shape: (icon && !children) || srOnly ? (shape ?? "icon") : shape,
              variant: variantToPass,
            }),
            buttonConfig?.classNames?.variants &&
              tv(
                buttonConfig.classNames
                  .variants as unknown as ExtractedTVButtonOptions,
              )({
                color: danger ? "danger" : color,
                disabled,
                primary: !primary && !!variant ? undefined : (primary ?? true),
                size: sizeToPass,
                shape:
                  (icon && !children) || srOnly ? (shape ?? "icon") : shape,
                variant,
              }),
            className,
          )}
          disabled={loading ?? disabled}
          aria-disabled={loading ?? disabled}
          type={htmlTypeToPass}
          color={htmlColor}
          {...props}
          style={{ ...props.style }}
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
