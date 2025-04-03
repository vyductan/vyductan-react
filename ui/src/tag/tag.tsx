import type { VariantProps } from "class-variance-authority";
import { tv } from "tailwind-variants";

import { cn } from "..";
import { useUiConfig } from "../store";

// Based on Vercel
const color: Record<string, string> = {
  default: "bg-gray-100 text-gray-600 border-gray-300",
  primary: "bg-primary-300 text-primary-700 border-primary-300",
  success: "bg-green-100 text-green-700 border-green-300",
  processing: "bg-blue-100 text-blue-700 border-blue-300",
  error: "bg-red-100 text-red-700 border-red-300",
  warning: "bg-amber-100 text-amber-700 border-amber-300",
  gray: "bg-gray-100 text-gray-600 border-gray-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  amber: "bg-amber-100 text-amber-700 border-amber-300",
  blue: "bg-blue-100 text-blue-700 border-blue-300",
  fuchsia: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
  green: "bg-green-100  border-green-300",
  orange: "bg-orange-100 text-orange-700 border-orange-300",
  red: "bg-red-100 text-red-700 border-red-300",
  rose: "bg-rose-100 text-rose-700 border-rose-300",
  pink: "bg-pink-100 text-pink-700 border-pink-300",
  purple: "bg-purple-100 text-purple-700 border-purple-300",
  teal: "bg-teal-100 text-teal-700 border-teal-300",

  "green-solid": "bg-green-600 text-white",
};

// Based on antd
const colorBordered: Record<string, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-300",
  primary: "bg-primary-200 text-primary-900 border-primary-600",
  success: "bg-success-muted text-success border-green-600",
  processing: "bg-blue-200 text-blue-900 border-blue-600",
  error: "bg-red-200 text-red-900 border-red-600",
  warning: "bg-amber-200 text-amber-900 border-amber-600",
  gray: "bg-gray-200 text-gray-950 border-gray-600",
  amber: "bg-amber-200 text-amber-900 border-amber-600",
  blue: "bg-blue-200 text-blue-900 border-blue-600",
  fuchsia: "bg-fuchsia-200 text-fuchsia-800 border-fuchsia-600",
  green: "bg-green-200 text-green-900 border-green-600",
  red: "bg-red-200 text-red-900 border-red-600",
  rose: "bg-rose-100 text-rose-600 border-rose-400",
  pink: "bg-pink-300 text-pink-900 border-pink-600",
  purple: "bg-purple-200 text-purple-900 border-purple-600",
  teal: "bg-teal-300 text-teal-900 border-teal-600",
};
const tagVariants = tv({
  base: [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow]",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",

    // "px-2.5",
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
      // own
      solid: "text-white",
    },
    color,
    bordered: {
      true: "",
      false: "border-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
    bordered: true,
  },
  compoundVariants: [
    {
      bordered: true,
      color: "default",
      className: colorBordered.default,
    },
    {
      bordered: true,
      color: "primary",
      className: colorBordered.primary,
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

interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {
  //
}

const Tag = ({
  className,
  variant,
  color,
  bordered: borderedProp = false,
  ...props
}: TagProps) => {
  const tagConfig = useUiConfig((state) => state.components.tag);

  return (
    <div
      className={cn(
        tagVariants({
          variant,
          color,
          bordered: borderedProp || tagConfig?.bordered,
        }),
        tagConfig?.className,
        className,
      )}
      {...props}
    />
  );
};

export { Tag, tagVariants, color as tagColors };
export type { TagProps };
