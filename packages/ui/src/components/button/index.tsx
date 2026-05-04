import type { XOR } from "ts-xor";

import type { Button as ShadcnButton } from "@acme/ui/shadcn/button";

import type { ButtonProps as ButtonProperties } from "./button";
import { Button as InternalButton } from "./button";

export { buttonVariants, buttonColorVariants } from "./button-variants";
export { LoadingIcon } from "./loading-icon";

type ShadcnButtonProperties = React.ComponentProps<typeof ShadcnButton>;
type ConditionButtonProperties = XOR<ButtonProperties, ShadcnButtonProperties>;

const ConditionButton = ({
  size,
  variant,
  shape,
  color,
  ...properties
}: ConditionButtonProperties) => {
  let mergedColor: ButtonProperties["color"] =
    color as ButtonProperties["color"];
  let mergedSize: ButtonProperties["size"];
  let mergedVariant: ButtonProperties["variant"];
  let mergedShape: ButtonProperties["shape"] = shape;

  switch (size) {
    case "xs": {
      mergedSize = "small";
      break;
    }
    case "sm": {
      mergedSize = "small";

      break;
    }
    case "lg": {
      mergedSize = "large";

      break;
    }
    case "icon": {
      mergedShape = "icon";

      break;
    }
    case "icon-xs": {
      mergedShape = "icon";
      mergedSize = "small";

      break;
    }
    case "icon-sm": {
      mergedShape = "icon";
      mergedSize = "small";

      break;
    }
    case "icon-lg": {
      mergedShape = "icon";
      mergedSize = "large";

      break;
    }
    case "default": {
      mergedSize = "middle";

      break;
    }
    default: {
      mergedSize = size ?? undefined;
    }
  }

  switch (variant) {
    case "outline": {
      mergedVariant = "outlined";

      break;
    }
    case "destructive": {
      mergedColor = "danger";

      break;
    }
    case "secondary": {
      mergedVariant = "filled";

      break;
    }
    case "ghost": {
      mergedVariant = "text";

      break;
    }
    case "default": {
      mergedVariant = "outlined";

      break;
    }
    case undefined: {
      mergedVariant = undefined;
      break;
    }
    default: {
      mergedVariant = variant ?? undefined;

      break;
    }
  }

  return (
    <InternalButton
      size={mergedSize}
      variant={mergedVariant}
      shape={mergedShape}
      color={mergedColor}
      {...properties}
    />
  );
};

ConditionButton.displayName = "Button";

export type { ButtonProps } from "./button";
export { ConditionButton as Button };
