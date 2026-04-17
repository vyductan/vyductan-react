import type { CSSProperties, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { tv } from "tailwind-variants";

import { Icon } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";
import { Badge } from "@acme/ui/shadcn/badge";

import type { BadgeProps } from "../badge";
import { useComponentConfig } from "../config-provider";

const familyColors = [
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "cyan",
  "blue",
  "indigo",
  "purple",
  "pink",
  "rose",
] as const;

type FamilyColor = (typeof familyColors)[number];

const legacyColorClasses: Record<string, string> = {
  default: "bg-gray-100 text-foreground border-gray-300",
  primary: "bg-primary-300 text-primary-700 border-primary-300",
  success: "bg-green-100 text-green-700 border-green-300",
  processing: "bg-blue-100 text-blue-700 border-blue-300",
  error: "bg-red-100 text-red-700 border-red-300",
  warning: "bg-amber-100 text-amber-700 border-amber-300",
  orange: "bg-orange-100 text-orange-700 border-orange-300",
  gray: "bg-gray-100 text-gray-600 border-gray-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  amber: "bg-amber-100 text-amber-700 border-amber-300",
  lime: "bg-lime-100 text-lime-700 border-lime-300",
  blue: "bg-blue-100 text-blue-700 border-blue-300",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
  fuchsia: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
  green: "bg-green-100 text-green-700 border-green-300",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-300",
  red: "bg-red-100 text-red-700 border-red-300",
  rose: "bg-rose-100 text-rose-700 border-rose-300",
  pink: "bg-pink-100 text-pink-700 border-pink-300",
  purple: "bg-purple-100 text-purple-700 border-purple-300",
  teal: "bg-teal-100 text-teal-700 border-teal-300",

  "green-solid": "bg-green-600 text-white",
};

const familyColorClasses: Record<
  FamilyColor,
  {
    filled: string;
    solid: string;
    outlined: string;
  }
> = {
  red: {
    filled: "bg-red-100 text-red-700 border-transparent",
    solid: "bg-red-600 text-white border-red-600",
    outlined: "bg-red-50 text-red-700 border-red-300",
  },
  orange: {
    filled: "bg-orange-100 text-orange-700 border-transparent",
    solid: "bg-orange-600 text-white border-orange-600",
    outlined: "bg-orange-50 text-orange-700 border-orange-300",
  },
  amber: {
    filled: "bg-amber-100 text-amber-700 border-transparent",
    solid: "bg-amber-600 text-white border-amber-600",
    outlined: "bg-amber-50 text-amber-700 border-amber-300",
  },
  lime: {
    filled: "bg-lime-100 text-lime-700 border-transparent",
    solid: "bg-lime-600 text-white border-lime-600",
    outlined: "bg-lime-50 text-lime-700 border-lime-300",
  },
  green: {
    filled: "bg-green-100 text-green-700 border-transparent",
    solid: "bg-green-600 text-white border-green-600",
    outlined: "bg-green-50 text-green-700 border-green-300",
  },
  cyan: {
    filled: "bg-cyan-100 text-cyan-700 border-transparent",
    solid: "bg-cyan-600 text-white border-cyan-600",
    outlined: "bg-cyan-50 text-cyan-700 border-cyan-300",
  },
  blue: {
    filled: "bg-blue-100 text-blue-700 border-transparent",
    solid: "bg-blue-600 text-white border-blue-600",
    outlined: "bg-blue-50 text-blue-700 border-blue-300",
  },
  indigo: {
    filled: "bg-indigo-100 text-indigo-700 border-transparent",
    solid: "bg-indigo-600 text-white border-indigo-600",
    outlined: "bg-indigo-50 text-indigo-700 border-indigo-300",
  },
  purple: {
    filled: "bg-purple-100 text-purple-700 border-transparent",
    solid: "bg-purple-600 text-white border-purple-600",
    outlined: "bg-purple-50 text-purple-700 border-purple-300",
  },
  pink: {
    filled: "bg-pink-100 text-pink-700 border-transparent",
    solid: "bg-pink-600 text-white border-pink-600",
    outlined: "bg-pink-50 text-pink-700 border-pink-300",
  },
  rose: {
    filled: "bg-rose-100 text-rose-700 border-transparent",
    solid: "bg-rose-600 text-white border-rose-600",
    outlined: "bg-rose-50 text-rose-700 border-rose-300",
  },
};

const tagVariants = tv({
  base: [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border font-medium whitespace-nowrap transition-[color,box-shadow]",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ],
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent",
      secondary:
        "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
      destructive:
        "bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 text-white",
      outline:
        "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      filled: "",
      solid: "text-white",
      outlined: "",
    },
    color: {
      default: "",
      primary: "",
      success: "",
      processing: "",
      error: "",
      warning: "",
      orange: "",
      gray: "",
      yellow: "",
      amber: "",
      lime: "",
      blue: "",
      indigo: "",
      fuchsia: "",
      green: "",
      cyan: "",
      red: "",
      rose: "",
      pink: "",
      purple: "",
      teal: "",
      "green-solid": "",
    },
    size: {
      default: "px-[7px] py-0.5 text-xs",
      small: "px-1.5 py-0.5 text-[10px]",
      large: "px-2.5 py-1 text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
    size: "default",
  },
  compoundVariants: [
    {
      color: "default",
      className: legacyColorClasses.default,
    },
    {
      color: "primary",
      className: legacyColorClasses.primary,
    },
    {
      variant: "default",
      color: "green",
      className: "text-green-700",
    },
    {
      variant: "solid",
      color: "green",
      className: "bg-green-600",
    },
  ],
});

type TagColor = VariantProps<typeof tagVariants>["color"];

type TagProps = BadgeProps &
  Omit<VariantProps<typeof tagVariants>, "color"> & {
    color?: TagColor | `#${string}`;
    icon?: ReactNode;
    closeIcon?: ReactNode;
    onClose?: () => void;
  };

function getNamedColorClassName(
  variant: TagProps["variant"],
  color: TagProps["color"],
): string | undefined {
  if (typeof color !== "string" || color.startsWith("#")) {
    return undefined;
  }

  const finalVariant = variant === "outlined" ? "outlined" : variant;
  let className: string | undefined;

  if (familyColors.includes(color as FamilyColor)) {
    const familyColor = color as FamilyColor;

    switch (finalVariant) {
      case "filled": {
        className = familyColorClasses[familyColor].filled;
        break;
      }
      case "solid": {
        className = familyColorClasses[familyColor].solid;
        break;
      }
      case "outlined": {
        className = familyColorClasses[familyColor].outlined;
        break;
      }
      default: {
        className = legacyColorClasses[familyColor];
        break;
      }
    }
  } else if (
    (finalVariant === "filled" ||
      finalVariant === "solid" ||
      finalVariant === "outlined") &&
    color in legacyColorClasses
  ) {
    className = legacyColorClasses[color];
  }

  if (finalVariant === "filled" && className) {
    return className.replaceAll(
      /border-(?!transparent)\S+/g,
      "border-transparent",
    );
  }

  return className;
}

function getHexStyle(
  variant: TagProps["variant"],
  color: TagProps["color"],
): CSSProperties | undefined {
  if (typeof color !== "string" || !color.startsWith("#")) {
    return undefined;
  }

  if (variant === "solid") {
    return {
      backgroundColor: color,
      borderColor: color,
      color: "#fff",
    };
  }

  if (variant === "filled") {
    return {
      backgroundColor: `color-mix(in srgb, ${color} 10%, white)`,
      color: `color-mix(in srgb, ${color} 80%, black)`,
    };
  }

  if (variant === "outlined") {
    return {
      backgroundColor: `color-mix(in srgb, ${color} 4%, white)`,
      borderColor: `color-mix(in srgb, ${color} 30%, white)`,
      color: `color-mix(in srgb, ${color} 84%, black)`,
    };
  }

  return undefined;
}

const Tag = ({
  className,
  variant,
  color,
  icon,
  closeIcon,
  onClose,
  style,
  ...props
}: TagProps) => {
  const tagConfig = useComponentConfig("tag");
  const finalVariant = variant ?? tagConfig.variant;
  const finalColor = color ?? tagConfig.color;
  const finalSize = props.size ?? tagConfig.size;
  const isHexColor = typeof finalColor === "string" && finalColor.startsWith("#");
  const colorName = isHexColor ? undefined : (finalColor as TagColor);
  const namedColorClassName = getNamedColorClassName(finalVariant, finalColor);
  const hexStyle = getHexStyle(finalVariant, finalColor);
  const mergedStyle = {
    ...tagConfig.style,
    ...hexStyle,
    ...style,
  };

  return (
    <Badge
      data-slot="tag"
      className={cn(
        tagVariants({
          variant: finalVariant,
          color: colorName,
          size: finalSize,
        }),
        namedColorClassName,
        closeIcon && "pr-1",
        isHexColor && finalVariant !== "solid" && "text-white",
        tagConfig.className,
        className,
      )}
      style={mergedStyle}
      {...props}
    >
      {icon}
      {props.children}
      {(typeof closeIcon === "boolean" && closeIcon) || onClose ? (
        <Icon
          aria-label="Close"
          icon="icon-[lucide--x]"
          className="size-3 cursor-pointer opacity-50 transition-opacity hover:opacity-100"
          tabIndex={-1}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
            onClose?.();
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        />
      ) : (
        closeIcon
      )}
    </Badge>
  );
};

export { Tag, tagVariants, legacyColorClasses as tagColors };
export type { TagProps };
