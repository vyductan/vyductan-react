"use client";

import { isValidElement } from "react";
import type * as React from "react";
import type { PartialDeep } from "type-fest";

import type { IconProps } from "@acme/ui/icons";
import { GenericSlot } from "@acme/ui/components/slot";
import { cn } from "@acme/ui/lib/utils";

import type { ButtonColorVariants, ButtonVariants } from "./button-variants";
import Wave from "../../lib/wave";
import { useComponentConfig } from "../config-provider/context";
import { buttonColorVariants, buttonVariants } from "./button-variants";
import { LoadingIcon } from "./loading-icon";

type TypeWithGeneric<T> = T[];
type ExtractGeneric<Type> = Type extends TypeWithGeneric<infer X> ? X : never;

type ExtractedTVButtonOptions = ExtractGeneric<
  TypeWithGeneric<typeof buttonVariants>
>;

type TVButtonOptions = PartialDeep<Partial<ExtractedTVButtonOptions>>;

type HtmlType = React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
type ButtonType = "default" | "primary" | "dashed" | "link" | "text";
type ColorVariantPairType = [
  color: ButtonColorVariants["color"],
  variant: ButtonColorVariants["variant"],
];

const ButtonTypeMap: Partial<Record<ButtonType, ColorVariantPairType>> = {
  default: ["default", "outlined"],
  primary: ["primary", "solid"],
  dashed: ["default", "dashed"],
  link: ["link", "link"],
  text: ["default", "text"],
};

export type ButtonProps = Omit<
  React.ComponentProps<"button">,
  "type" | "color"
> &
  ButtonVariants &
  ButtonColorVariants & {
    ref?: React.Ref<HTMLButtonElement>;
    type?: HtmlType | ButtonType;
    htmlType?: HtmlType;
    htmlColor?: React.CSSProperties["color"];
    asChild?: boolean;
    href?: string;
    loading?: boolean;
    icon?: React.ReactNode;
    // color?: ButtonColorVariants["color"];
    // variant?: Exclude<ButtonColorVariants["variant"], "primary">;
    classNames?: {
      variants?: TVButtonOptions;
    };
    // size?: ButtonVariants["size"];
    danger?: boolean;
  };

const Button = ({
  asChild = false,
  href,
  children,

  className,
  type: typeProperty,
  color: colorProperty,
  size: sizeProperty,
  variant: variantProperty,
  shape,
  icon,
  disabled,
  loading,
  danger,
  htmlType,
  htmlColor,
  srOnly,
  ...properties
}: ButtonProps) => {
  const {
    type: typeConfig,
    color: colorConfig,
    size: sizeConfig,
    variant: variantConfig,
  } = useComponentConfig("button");

  // Validate accessibility for icon-only buttons
  const isIconOnly = (!!icon || loading) && !children && !srOnly;
  const hasAccessibleName =
    !!properties["aria-label"] || properties["aria-labelledby"];

  if (
    process.env.NODE_ENV !== "production" &&
    isIconOnly &&
    !hasAccessibleName
  ) {
    console.warn(
      "Button: Icon-only buttons must have an accessible name. Please provide either 'aria-label' or 'aria-labelledby' prop.",
    );
  }

  // antd-style warning: `icon` is a ReactNode, not an icon-name string.
  if (process.env.NODE_ENV !== "production" && typeof icon === "string") {
    console.warn(
      `Button: \`icon\` must be a ReactNode element, not a string. Received "${icon}". Wrap it, e.g. icon={<Icon icon="${icon}" />}.`,
    );
  }

  const size = sizeProperty ?? sizeConfig;

  const defaultType = variantProperty ? "default" : "primary";
  const type = typeProperty ?? typeConfig ?? defaultType;
  const isHtmlType = type === "submit" || type === "reset" || type === "button";
  const htmlTypeToPass = isHtmlType ? type : (htmlType ?? "button");

  // Map type to [color, variant] using ButtonTypeMap
  // Default to "default" type if no button type is provided (Ant Design behavior)
  const buttonType: ButtonType = isHtmlType ? defaultType : type;

  let color = colorProperty ?? colorConfig;
  let variant = variantProperty ?? variantConfig;
  const isDashed = variant === "dashed" || buttonType === "dashed";

  // Map type to color/variant using ButtonTypeMap
  if (buttonType in ButtonTypeMap) {
    const mapping = ButtonTypeMap[buttonType];
    if (mapping) {
      const [mappedColor, mappedVariant] = mapping;
      // Only use mapped values if not explicitly overridden
      color ??= mappedColor;
      variant ??= mappedVariant;
    }
  }

  // Convert "dashed" to "outlined" for styling
  if (variant === "dashed") {
    variant = "outlined";
  }

  // Apply danger color override
  if (danger) {
    color = "danger";
  }

  // Check if original variant is dashed for border-dashed class

  const Comp = asChild || href ? GenericSlot : "button";

  // Radix Slot clones its props onto a single element child, so a non-element
  // icon (string / number / fragment) would throw "Slot failed to slot onto
  // its children". Mirror antd's IconWrapper: Slot when it's a real element
  // (keeps class-merge sizing), otherwise wrap in a <span> so any ReactNode is
  // safe instead of crashing.
  const iconChild = loading ? <LoadingIcon /> : icon;
  const iconNode = isValidElement(iconChild) ? (
    <GenericSlot<Partial<IconProps>>
      className={cn("size-4", size === "small" && "size-[14px]")}
    >
      {iconChild}
    </GenericSlot>
  ) : (
    <span className="inline-flex items-center justify-center">{iconChild}</span>
  );

  const ChildrenToRender = (
    <>
      {(!!loading || icon) && iconNode}
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
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(
          "relative",
          isDashed && "border-dashed",
          buttonVariants({
            size,
            shape: (icon && !children) || srOnly ? (shape ?? "icon") : shape,
          }),
          buttonColorVariants({
            variant,
            color,
            disabled,
          }),
          className,
        )}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        type={htmlTypeToPass}
        color={htmlColor}
        {...properties}
        style={{ ...properties.style }}
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

export { Button };
