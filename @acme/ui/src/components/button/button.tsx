"use client";

import { isValidElement, useEffect, useRef } from "react";
import type * as React from "react";
import { composeRef } from "@rc-component/util/es/ref";
import type { PartialDeep } from "type-fest";

import type { IconProps } from "@acme/ui/icons";
import { GenericSlot } from "@acme/ui/components/slot";
import { cn } from "@acme/ui/lib/utils";

import type { SizeType } from "../config-provider/size-context";
import type { ButtonColorVariants, ButtonVariants } from "./button-variants";
import Wave from "../../lib/wave";
import { useComponentConfig } from "../config-provider/context";
import useSize from "../config-provider/hooks/use-size";
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

// Dev-only: elements already warned about, so each nameless button logs once
// instead of on every re-render.
const warnedAccessibleName = new WeakSet<Element>();

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
  ref,
  ...properties
}: ButtonProps) => {
  const {
    type: typeConfig,
    color: colorConfig,
    size: sizeConfig,
    variant: variantConfig,
  } = useComponentConfig("button");

  // Validate accessibility on the rendered element instead of props: the
  // accessible name may come from sources props can't see (sr-only text
  // inside `icon`, `title`, slotted children via asChild).
  const a11yNameRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const element = a11yNameRef.current;
    if (!element || warnedAccessibleName.has(element)) return;
    const hasAccessibleName =
      !!element.getAttribute("aria-label") ||
      !!element.getAttribute("aria-labelledby") ||
      !!element.getAttribute("title") ||
      !!element.textContent?.trim();
    if (!hasAccessibleName) {
      warnedAccessibleName.add(element);
      console.warn(
        "Button: Buttons without visible text must have an accessible name. Provide 'aria-label', 'aria-labelledby', 'title', or sr-only text.",
        element,
      );
    }
  });
  const mergedRef =
    process.env.NODE_ENV === "production"
      ? ref
      : // eslint-disable-next-line react-hooks/refs
        composeRef(ref ?? null, a11yNameRef as React.Ref<HTMLButtonElement>);

  // antd-style warning: `icon` is a ReactNode, not an icon-name string.
  if (process.env.NODE_ENV !== "production" && typeof icon === "string") {
    console.warn(
      `Button: \`icon\` must be a ReactNode element, not a string. Received "${icon}". Wrap it, e.g. icon={<Icon icon="${icon}" />}.`,
    );
  }

  // Explicit prop > ConfigProvider button.size > ambient SizeContext (e.g.
  // <Form size> / <SizeContextProvider>). Falls back to buttonVariants' middle.
  const ctxSize = useSize<SizeType>();
  const size = sizeProperty ?? sizeConfig ?? ctxSize;

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
        ref={mergedRef}
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
