import type { VariantProps } from "class-variance-authority";
import { tv } from "tailwind-variants";

import { cn } from "..";
import { useUiConfig } from "../store";

// Based on Vercel
const color: Record<string, string> = {
  default: "bg-gray-100 text-gray-600 border-gray-600",
  primary: "bg-primary-100 text-primary-600 border-primary-600",
  success: "bg-success-muted text-success border-green-600",
  processing: "bg-blue-100 text-blue-600 border-blue-600",
  error: "bg-red-100 text-red-600 border-red-600",
  warning: "bg-amber-100 text-amber-600 border-amber-600",
  gray: "bg-gray-100 text-gray-600 border-gray-600",
  amber: "bg-amber-100 text-amber-600 border-amber-600",
  blue: "bg-blue-100 text-blue-600 border-blue-600",
  fuchsia: "bg-fuchsia-100 text-fuchsia-600 border-fuchsia-600",
  green: "bg-green-100 text-green-600 border-green-600",
  orange: "bg-orange-100 text-orange-600 border-orange-600",
  red: "bg-red-100 text-red-600 border-red-600",
  rose: "bg-rose-100 text-rose-600 border-rose-400",
  pink: "bg-pink-100 text-pink-600 border-pink-600",
  purple: "bg-purple-100 text-purple-600 border-purple-600",
  teal: "bg-teal-100 text-teal-600 border-teal-600",
};

// Based on antd
const colorBordered: Record<string, string> = {
  default: "bg-gray-200 text-gray-950 border-gray-600",
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
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap transition-[color,box-shadow]",
    "ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
    "focus-visible:ring-4 focus-visible:outline-1",
    "aria-invalid:focus-visible:ring-0",

    // "rounded-sm px-2.5 font-medium",
  ],
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent shadow-sm",
      secondary:
        "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
      destructive:
        "bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 border-transparent shadow-sm",
      outline:
        "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
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
