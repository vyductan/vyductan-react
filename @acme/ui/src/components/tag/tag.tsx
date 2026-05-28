import type { VariantProps } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { tv } from "tailwind-variants";

import { Icon } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";
import { Badge } from "@acme/ui/shadcn/badge";

import type { BadgeProps } from "../badge";
import { useComponentConfig } from "../config-provider";

const tailwindPresetColors = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "black",
  "white",
] as const;

type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);
type TailwindPresetColor = (typeof tailwindPresetColors)[number];
type AntDesignPresetColor =
  | "blue"
  | "purple"
  | "cyan"
  | "green"
  | "magenta"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "volcano"
  | "geekblue"
  | "lime"
  | "gold";
type TagPresetColor =
  | "default"
  | "primary"
  | "success"
  | "processing"
  | "error"
  | "warning"
  | TailwindPresetColor
  | AntDesignPresetColor
  | "green-solid";

type FamilyColor = TailwindPresetColor;

type ColorClassNames = {
  filled: string;
  solid: string;
  outlined: string;
};

const antDesignColorAliases: Partial<
  Record<AntDesignPresetColor, FamilyColor>
> = {
  magenta: "pink",
  volcano: "orange",
  geekblue: "indigo",
  gold: "amber",
};

const legacyColorClasses: Record<string, string> = {
  default: "bg-gray-100 text-foreground border-gray-300",
  primary: "bg-primary-300 text-primary-700 border-primary-300",
  success: "bg-green-100 text-green-700 border-green-300",
  processing: "bg-blue-100 text-blue-700 border-blue-300",
  error: "bg-red-100 text-red-700 border-red-300",
  warning: "bg-amber-100 text-amber-700 border-amber-300",
  "green-solid": "bg-green-600 text-white",
};

const familyColorClasses: Record<FamilyColor, ColorClassNames> = {
  slate: {
    filled: "bg-slate-100 text-slate-700 border-transparent",
    solid: "bg-slate-600 text-white border-slate-600",
    outlined: "bg-slate-50 text-slate-700 border-slate-300",
  },
  gray: {
    filled: "bg-gray-100 text-gray-700 border-transparent",
    solid: "bg-gray-600 text-white border-gray-600",
    outlined: "bg-gray-50 text-gray-700 border-gray-300",
  },
  zinc: {
    filled: "bg-zinc-100 text-zinc-700 border-transparent",
    solid: "bg-zinc-600 text-white border-zinc-600",
    outlined: "bg-zinc-50 text-zinc-700 border-zinc-300",
  },
  neutral: {
    filled: "bg-neutral-100 text-neutral-700 border-transparent",
    solid: "bg-neutral-600 text-white border-neutral-600",
    outlined: "bg-neutral-50 text-neutral-700 border-neutral-300",
  },
  stone: {
    filled: "bg-stone-100 text-stone-700 border-transparent",
    solid: "bg-stone-600 text-white border-stone-600",
    outlined: "bg-stone-50 text-stone-700 border-stone-300",
  },
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
  yellow: {
    filled: "bg-yellow-100 text-yellow-800 border-transparent",
    solid: "bg-yellow-500 text-white border-yellow-500",
    outlined: "bg-yellow-50 text-yellow-800 border-yellow-300",
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
  emerald: {
    filled: "bg-emerald-100 text-emerald-700 border-transparent",
    solid: "bg-emerald-600 text-white border-emerald-600",
    outlined: "bg-emerald-50 text-emerald-700 border-emerald-300",
  },
  teal: {
    filled: "bg-teal-100 text-teal-700 border-transparent",
    solid: "bg-teal-600 text-white border-teal-600",
    outlined: "bg-teal-50 text-teal-700 border-teal-300",
  },
  cyan: {
    filled: "bg-cyan-100 text-cyan-700 border-transparent",
    solid: "bg-cyan-600 text-white border-cyan-600",
    outlined: "bg-cyan-50 text-cyan-700 border-cyan-300",
  },
  sky: {
    filled: "bg-sky-100 text-sky-700 border-transparent",
    solid: "bg-sky-600 text-white border-sky-600",
    outlined: "bg-sky-50 text-sky-700 border-sky-300",
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
  violet: {
    filled: "bg-violet-100 text-violet-700 border-transparent",
    solid: "bg-violet-600 text-white border-violet-600",
    outlined: "bg-violet-50 text-violet-700 border-violet-300",
  },
  purple: {
    filled: "bg-purple-100 text-purple-700 border-transparent",
    solid: "bg-purple-600 text-white border-purple-600",
    outlined: "bg-purple-50 text-purple-700 border-purple-300",
  },
  fuchsia: {
    filled: "bg-fuchsia-100 text-fuchsia-700 border-transparent",
    solid: "bg-fuchsia-600 text-white border-fuchsia-600",
    outlined: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-300",
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
  black: {
    filled: "bg-black text-white border-transparent",
    solid: "bg-black text-white border-black",
    outlined: "bg-white text-black border-black",
  },
  white: {
    filled: "bg-white text-foreground border-transparent",
    solid: "bg-white text-foreground border-gray-300",
    outlined: "bg-white text-foreground border-gray-300",
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
      slate: "",
      gray: "",
      zinc: "",
      neutral: "",
      stone: "",
      red: "",
      orange: "",
      amber: "",
      yellow: "",
      lime: "",
      green: "",
      emerald: "",
      teal: "",
      cyan: "",
      sky: "",
      blue: "",
      indigo: "",
      violet: "",
      purple: "",
      fuchsia: "",
      pink: "",
      rose: "",
      black: "",
      white: "",
      magenta: "",
      volcano: "",
      geekblue: "",
      gold: "",
      "green-solid": "",
    },
    size: {
      default: "px-[7px] py-0.5 text-xs",
      small: "px-1.5 py-0.5 text-[10px]",
      large: "px-2.5 py-1 text-sm",
    },
  },
  defaultVariants: {
    variant: "filled",
    color: "default",
    size: "default",
  },
});

type TagColor = TagPresetColor;

type TagProps = BadgeProps &
  Omit<VariantProps<typeof tagVariants>, "color"> & {
    color?: LiteralUnion<TagColor>;
    icon?: ReactNode;
    closeIcon?: ReactNode;
    onClose?: () => void;
  };

function normalizeVariant(variant: TagProps["variant"]): TagProps["variant"] {
  return variant === "solid" || variant === "outlined" ? variant : "filled";
}

function isTailwindPresetColor(color: string): color is TailwindPresetColor {
  return tailwindPresetColors.includes(color as TailwindPresetColor);
}

function getFamilyColor(color: string): FamilyColor | undefined {
  if (isTailwindPresetColor(color)) {
    return color;
  }

  return antDesignColorAliases[color as AntDesignPresetColor];
}

function normalizeColor(color: TagProps["color"]): TagProps["color"] {
  if (color === undefined) {
    return "default";
  }

  if (
    typeof color !== "string" ||
    color.startsWith("#") ||
    color in legacyColorClasses ||
    getFamilyColor(color)
  ) {
    return color;
  }

  return "default";
}

function getNamedColorClassName(
  variant: TagProps["variant"],
  color: TagProps["color"],
): string | undefined {
  if (typeof color !== "string" || color.startsWith("#")) {
    return undefined;
  }

  const finalVariant = variant === "outlined" ? "outlined" : variant;
  let className: string | undefined;

  const familyColor = getFamilyColor(color);

  if (familyColor) {
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
  const finalVariant = normalizeVariant(variant ?? tagConfig.variant);
  const finalColor = normalizeColor(color ?? tagConfig.color);
  const finalSize = props.size ?? tagConfig.size;
  const isHexColor =
    typeof finalColor === "string" && finalColor.startsWith("#");
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
      variant="ghost"
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
