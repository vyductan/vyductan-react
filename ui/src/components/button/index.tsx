import type { XOR } from "ts-xor";

import type { Button as ShadcnButton } from "@acme/ui/shadcn/button";

import type { ButtonProps } from "./button";
import { Button as InternalButton } from "./button";

export { buttonVariants, buttonColorVariants } from "./button-variants";
export { LoadingIcon } from "./loading-icon";

type ShadcnButtonProps = React.ComponentProps<typeof ShadcnButton>;
type ConditionButtonProps = XOR<ButtonProps, ShadcnButtonProps>;

const ConditionButton = ({
  size,
  variant,
  shape,
  color,
  ...props
}: ConditionButtonProps) => {
  let mergedColor: ButtonProps["color"] = color as ButtonProps["color"];
  let mergedSize: ButtonProps["size"];
  let mergedVariant: ButtonProps["variant"];
  let mergedShape: ButtonProps["shape"] = shape;

  switch (size) {
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
    case null: {
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
      {...props}
    />
  );
};

ConditionButton.displayName = "Button";

export type { ButtonProps } from "./button";
export { ConditionButton as Button };
