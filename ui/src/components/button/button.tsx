"use client";

import type * as React from "react";
import type { PartialDeep } from "type-fest";
import { GenericSlot } from "@/components/ui/slot";
import { Slot } from "@radix-ui/react-slot";

import type { IconProps } from "@acme/ui/icons";
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
  type: typeProp,
  color: colorProp,
  size: sizeProp,
  variant: variantProp,
  shape,
  icon,
  disabled,
  loading,
  danger,
  htmlType,
  htmlColor,
  srOnly,
  ...props
}: ButtonProps) => {
  const {
    type: typeConfig,
    color: colorConfig,
    size: sizeConfig,
    variant: variantConfig,
  } = useComponentConfig("button");

  // Validate accessibility for icon-only buttons
  const isIconOnly = (!!icon || loading) && !children && !srOnly;
  const hasAccessibleName = !!props["aria-label"] || props["aria-labelledby"];

  if (process.env.NODE_ENV !== "production" && isIconOnly && !hasAccessibleName) {
    console.warn(
      "Button: Icon-only buttons must have an accessible name. Please provide either 'aria-label' or 'aria-labelledby' prop."
    );
  }

  const size = sizeProp ?? sizeConfig;

  const type = typeProp ?? typeConfig ?? "default";
  const isHtmlType = type === "submit" || type === "reset" || type === "button";
  const htmlTypeToPass = isHtmlType ? type : (htmlType ?? "button");

  // Map type to [color, variant] using ButtonTypeMap
  // Default to "default" type if no button type is provided (Ant Design behavior)
  const buttonType: ButtonType = isHtmlType ? "default" : type;

  let color = colorProp ?? colorConfig;
  let variant = variantProp ?? variantConfig;
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

  const Comp = asChild || href ? Slot : "button";

  const ChildrenToRender = (
    <>
      {(!!loading || icon) && (
        <GenericSlot<Partial<IconProps>>
          className={cn("size-4", size === "small" && "size-[14px]")}
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

export { Button };
