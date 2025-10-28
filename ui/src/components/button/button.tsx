"use client";

import type * as React from "react";
import type { VariantProps } from "tailwind-variants";
import type { PartialDeep } from "type-fest";
import { useUiConfig } from "@/components/ui/config-provider";
import { GenericSlot } from "@/components/ui/slot";
import { Slot } from "@radix-ui/react-slot";
import { tv } from "tailwind-variants";

import type { IconProps } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

import Wave from "../../lib/wave";
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
    action: {
      true: [],
    },
    color: {
      default: [],
      primary: [],
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
      lg: "",
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
      // Shadcn
      destructive:
        "border-red-600 bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-600/20 active:bg-red-800 dark:focus-visible:ring-red-600/40",
      secondary: [],
      ghost: [],
      outline: [],

      // Own
      solid: ["text-white", "hover:text-white"],
      outlined: [
        // "hover:bg-accent",
        "border-input bg-background hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs",
      ],
      dashed: [],
      // filled: [],
      // ghost: [
      //   "border-none",
      //   // "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-none",
      // ],
      filled: ["border-transparent", "hover:bg-background-hover"],
      link: ["border-0"],
      text: "border-none",
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
    // solid
    {
      variant: "solid",
      color: "default",
      className: [
        "border-button-solid bg-button-solid",
        "hover:border-button-solid-hover hover:bg-button-solid-hover",
        "active:border-button-solid-active active:bg-button-solid-active",
      ],
    },
    {
      variant: "solid",
      color: "primary",
      className: [
        "border-primary bg-primary",
        "hover:border-primary-hover hover:bg-primary-hover",
        "active:border-primary-active active:bg-primary-active",
      ],
    },
    {
      variant: "solid",
      color: "danger",
      className: [
        "border-red-500 bg-red-500",
        "hover:border-red-400 hover:bg-red-400",
        "active:border-red-600 active:bg-red-600",
      ],
    },
    {
      variant: "solid",
      color: "orange",
      className: [
        "border-orange-500 bg-orange-500",
        "hover:border-orange-400 hover:bg-orange-400",
        "active:border-orange-600 active:bg-orange-600",
      ],
    },
    {
      variant: "solid",
      color: "green",
      className: [
        "border-green-500 bg-green-500",
        "hover:border-green-400 hover:bg-green-400",
        "active:border-green-600 active:bg-green-600",
      ],
    },
    {
      variant: "solid",
      color: "emerald",
      className: [
        "border-emerald-500 bg-emerald-500",
        "hover:border-emerald-400 hover:bg-emerald-400",
        "active:border-emerald-600 active:bg-emerald-600",
      ],
    },
    {
      variant: "solid",
      color: "cyan",
      className: [
        "border-cyan-500 bg-cyan-500",
        "hover:border-cyan-400 hover:bg-cyan-400",
        "active:border-cyan-600 active:bg-cyan-600",
      ],
    },
    {
      variant: "solid",
      color: "blue",
      className: [
        "border-blue-500 bg-blue-500",
        "hover:border-blue-400 hover:bg-blue-400",
        "active:border-blue-600 active:bg-blue-600",
      ],
    },
    {
      variant: "solid",
      color: "indigo",
      className: [
        "border-indigo-500 bg-indigo-500",
        "hover:border-indigo-400 hover:bg-indigo-400",
        "active:border-indigo-600 active:bg-indigo-600",
      ],
    },
    {
      variant: "solid",
      color: "purple",
      className: [
        "border-purple-500 bg-purple-500",
        "hover:border-purple-400 hover:bg-purple-400",
        "active:border-purple-600 active:bg-purple-600",
      ],
    },
    {
      variant: "solid",
      color: "pink",
      className: [
        "border-pink-500 bg-pink-500",
        "hover:border-pink-400 hover:bg-pink-400",
        "active:border-pink-600 active:bg-pink-600",
      ],
    },
    // outlined
    {
      variant: "outlined",
      color: "default",
      className: [
        "",
        "hover:border-primary-hover hover:text-primary-hover",
        "active:border-primary-active active:text-primary-active",
      ],
    },
    {
      variant: "outlined",
      color: "primary",
      className: [
        "border-primary text-primary",
        "hover:border-primary-hover hover:text-primary-hover",
        "active:border-primary-active active:text-primary-active",
      ],
    },
    {
      variant: "outlined",
      color: "link",
      className: ["text-link", "hover:bg-link-hover hover:text-white"],
    },
    {
      variant: "outlined",
      color: "danger",
      className: [
        "border-red-500 text-red-500",
        "hover:border-red-400 hover:text-red-400",
        "active:border-red-600 active:text-red-600",
      ],
    },
    {
      variant: "outlined",
      color: "orange",
      className: [
        "border-orange-500 text-orange-500",
        "hover:border-orange-400 hover:text-orange-400",
        "active:border-orange-600 active:text-orange-600",
      ],
    },
    {
      variant: "outlined",
      color: "green",
      className: [
        "border-green-500 text-green-500",
        "hover:border-green-400 hover:text-green-400",
        "active:border-green-600 active:text-green-600",
      ],
    },
    {
      variant: "outlined",
      color: "emerald",
      className: [
        "border-emerald-500 text-emerald-500",
        "hover:border-emerald-400 hover:text-emerald-400",
        "active:border-emerald-600 active:text-emerald-600",
      ],
    },
    {
      variant: "outlined",
      color: "cyan",
      className: [
        "border-cyan-500 text-cyan-500",
        "hover:border-cyan-400 hover:text-cyan-400",
        "active:border-cyan-600 active:text-cyan-600",
      ],
    },
    {
      variant: "outlined",
      color: "blue",
      className: [
        "border-blue-500 text-blue-500",
        "hover:border-blue-400 hover:text-blue-400",
        "active:border-blue-600 active:text-blue-600",
      ],
    },
    {
      variant: "outlined",
      color: "indigo",
      className: [
        "border-indigo-500 text-indigo-500",
        "hover:border-indigo-400 hover:text-indigo-400",
        "active:border-indigo-600 active:text-indigo-600",
      ],
    },
    {
      variant: "outlined",
      color: "purple",
      className: [
        "border-purple-500 text-purple-500",
        "hover:border-purple-400 hover:text-purple-400",
        "active:border-purple-600 active:text-purple-600",
      ],
    },
    {
      variant: "outlined",
      color: "pink",
      className: [
        "border-pink-500 text-pink-500",
        "hover:border-pink-400 hover:text-pink-400",
        "active:border-pink-600 active:text-pink-600",
      ],
    },
    // filled | light
    {
      variant: "filled",
      color: "default",
      className: [
        "bg-secondary",
        "hover:bg-secondary-hover",
        "active:bg-secondary-active",
      ],
    },
    {
      variant: "filled",
      color: "primary",
      className: [
        "bg-primary-50 text-primary",
        "hover:bg-primary-100 hover:text-primary",
        "active:bg-primary-200 active:text-primary-active",
      ],
    },
    {
      variant: "filled",
      color: "danger",
      className: [
        "bg-red-50 text-red-500",
        "hover:bg-red-100 hover:text-red-500",
        "active:bg-red-200 active:text-red-500",
      ],
    },
    {
      variant: "filled",
      color: "orange",
      className: [
        "bg-orange-100 text-orange-600",
        "hover:bg-orange-200 hover:text-orange-700",
      ],
    },
    {
      variant: "filled",
      color: "green",
      className: [
        "bg-green-100 text-green-600",
        "hover:bg-green-200 hover:text-green-700",
      ],
    },
    {
      variant: "filled",
      color: "emerald",
      className: [
        "bg-emerald-100 text-emerald-600",
        "hover:bg-emerald-200 hover:text-emerald-700",
      ],
    },
    {
      variant: "filled",
      color: "cyan",
      className: [
        "bg-cyan-100 text-cyan-600",
        "hover:bg-cyan-200 hover:text-cyan-700",
      ],
    },
    {
      variant: "filled",
      color: "blue",
      className: [
        "bg-blue-100 text-blue-600",
        "hover:bg-blue-200 hover:text-blue-700",
      ],
    },
    {
      variant: "filled",
      color: "indigo",
      className: [
        "bg-indigo-100 text-indigo-600",
        "hover:bg-indigo-200 hover:text-indigo-700",
      ],
    },
    {
      variant: "filled",
      color: "link",
      className: [
        "text-link bg-blue-100",
        "hover:bg-link-hover hover:text-white",
      ],
    },
    {
      variant: "filled",
      color: "purple",
      className: [
        "bg-purple-100 text-purple-600",
        "hover:bg-purple-200 hover:text-purple-700",
      ],
    },
    {
      variant: "filled",
      color: "pink",
      className: [
        "bg-pink-100 text-pink-600",
        "hover:bg-pink-200 hover:text-pink-700",
      ],
    },
    // Text
    {
      variant: "text",
      color: "default",
      className: ["", "hover:bg-secondary", "active:bg-secondary-active"],
    },
    {
      variant: "text",
      color: "primary",
      className: [
        "text-primary",
        "hover:bg-primary-50 hover:text-primary-hover",
        "active:bg-primary-200 active:text-primary-active",
      ],
    },
    {
      variant: "text",
      color: "danger",
      className: [
        "text-red-500",
        "hover:bg-red-50 hover:text-red-400",
        "active:bg-red-200 active:text-red-600",
      ],
    },
    {
      variant: "text",
      color: "green",
      className: [
        "text-green-500",
        "hover:bg-green-50 hover:text-green-400",
        "active:bg-green-200 active:text-green-600",
      ],
    },
    {
      variant: "text",
      color: "emerald",
      className: [
        "text-emerald-500",
        "hover:bg-emerald-50 hover:text-emerald-400",
        "active:bg-emerald-200 active:text-emerald-600",
      ],
    },
    {
      variant: "text",
      color: "cyan",
      className: [
        "text-cyan-500",
        "hover:bg-cyan-50 hover:text-cyan-400",
        "active:bg-cyan-200 active:text-cyan-600",
      ],
    },
    {
      variant: "text",
      color: "blue",
      className: [
        "text-blue-500",
        "hover:bg-blue-50 hover:text-blue-400",
        "active:bg-blue-200 active:text-blue-600",
      ],
    },
    {
      variant: "text",
      color: "indigo",
      className: [
        "text-indigo-500",
        "hover:bg-indigo-50 hover:text-indigo-400",
        "active:bg-indigo-200 active:text-indigo-600",
      ],
    },
    {
      variant: "text",
      color: "purple",
      className: [
        "text-purple-500",
        "hover:bg-purple-50 hover:text-purple-400",
        "active:bg-purple-200 active:text-purple-600",
      ],
    },
    {
      variant: "text",
      color: "pink",
      className: [
        "text-pink-500",
        "hover:bg-pink-50 hover:text-pink-400",
        "active:bg-pink-200 active:text-pink-600",
      ],
    },

    // Link
    {
      variant: "link",
      color: "default",
      className: ["", "hover:text-primary-hover", "active:text-primary-active"],
    },
    {
      variant: "link",
      color: "primary",
      className: [
        "text-primary",
        "hover:text-primary-hover",
        "active:text-primary-active",
      ],
    },
    {
      variant: "link",
      color: "link",
      className: [
        "text-primary",
        "hover:text-primary-hover",
        "active:text-primary-active",
      ],
    },
    {
      variant: "link",
      color: "danger",
      className: ["text-red-500", "hover:text-red-400", "active:text-red-600"],
    },
    {
      variant: "link",
      color: "pink",
      className: [
        "text-pink-500",
        "hover:text-pink-400",
        "active:text-pink-600",
      ],
    },
    {
      variant: "link",
      color: "purple",
      className: [
        "text-purple-500",
        "hover:text-purple-400",
        "active:text-purple-600",
      ],
    },
    {
      variant: "link",
      color: "cyan",
      className: [
        "text-cyan-500",
        "hover:text-cyan-400",
        "active:text-cyan-600",
      ],
    },
    // ========
    // Size
    {
      size: "small",
      shape: ["icon", "circle"],
      className: "w-6",
    },
    {
      size: ["middle", "default"],
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
    // variant: "default",
    // color: "default",
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
type ButtonType = "default" | "primary" | "dashed" | "link" | "text";
type ColorVariantPairType = [
  color: ButtonVariants["color"],
  variant: ButtonVariants["variant"],
];

const ButtonTypeMap: Partial<Record<ButtonType, ColorVariantPairType>> = {
  default: ["default", "outlined"],
  primary: ["primary", "solid"],
  dashed: ["default", "dashed"],
  link: ["link", "link"],
  text: ["default", "text"],
};

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "color">,
    Omit<ButtonVariants, "type" | "color" | "disabled" | "variant" | "size"> {
  ref?: React.Ref<HTMLButtonElement>;
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

const Button = ({
  asChild = false,
  href,
  children,
  className,
  color,
  disabled,
  loading,
  size,
  shape,
  srOnly,
  variant,
  icon,
  type = "default",
  htmlType,
  htmlColor,
  danger,
  ...props
}: ButtonProps) => {
  const buttonConfig = useUiConfig((state) => state.components.button);
  let sizeToPass = size as ButtonVariants["size"];
  if (size === "sm") {
    sizeToPass = "small";
  }

  const Comp = asChild || href ? Slot : "button";

  const ChildrenToRender = (
    <>
      {(!!loading || icon) && (
        <GenericSlot<Partial<IconProps>>
          className={cn("size-4", sizeToPass === "small" && "size-[14px]")}
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

  const isHtmlType = type === "submit" || type === "reset" || type === "button";
  const htmlTypeToPass = isHtmlType ? type : (htmlType ?? "button");

  // Map type to [color, variant] using ButtonTypeMap
  // Default to "default" type if no button type is provided (Ant Design behavior)
  const buttonType: ButtonType = isHtmlType ? "default" : type;

  let colorToPass: ButtonVariants["color"] = color;
  let variantToPass: ButtonVariants["variant"] = variant;

  // Map type to color/variant using ButtonTypeMap
  if (buttonType in ButtonTypeMap) {
    const mapping = ButtonTypeMap[buttonType];
    if (mapping) {
      const [mappedColor, mappedVariant] = mapping;
      // Only use mapped values if not explicitly overridden
      if (!color) {
        colorToPass = mappedColor;
      }
      if (!variant) {
        variantToPass = mappedVariant;
      }
    }
  }

  // Convert "outline" and "dashed" to "outlined" for styling
  if (variantToPass === "outline" || variantToPass === "dashed") {
    variantToPass = "outlined";
  }

  // Apply danger color override
  if (danger) {
    colorToPass = "danger";
  }

  // Check if original variant is dashed for border-dashed class
  const isDashed = variant === "dashed" || buttonType === "dashed";

  return (
    <Wave component="Button" disabled={loading}>
      <Comp
        className={cn(
          "relative",
          isDashed && "border-dashed",
          buttonVariants({
            color: colorToPass,
            disabled,
            size: sizeToPass,
            shape: (icon && !children) || srOnly ? (shape ?? "icon") : shape,
            variant: variantToPass,
          }),
          buttonConfig?.classNames?.variants &&
            tv(
              buttonConfig.classNames
                .variants as unknown as ExtractedTVButtonOptions,
            )({
              color: colorToPass,
              disabled,
              size: sizeToPass,
              shape: (icon && !children) || srOnly ? (shape ?? "icon") : shape,
              variant: variantToPass,
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
          <a href={href}>{ChildrenToRender}</a>
        ) : (
          ChildrenToRender
        )}
      </Comp>
    </Wave>
  );
};

export type { ButtonVariants };

export { Button, buttonVariants };

export { LoadingIcon } from "./loading-icon";
