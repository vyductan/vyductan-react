import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { tv } from "tailwind-variants";

import { cn } from "..";

const color: Record<string, string> = {
  default: "bg-gray-200 text-gray-950  border-gray-600",
  primary: "bg-primary-200 text-primary-900  border-primary-600",
  success: "bg-success-muted text-success  border-green-600",
  processing: "bg-blue-200 text-blue-900  border-blue-600",
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
    "text-xs",
    "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  ],
  variants: {
    variant: {
      default: ["border-transparent", "whitespace-nowrap"],
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground",
    },
    color,
    bordered: {
      true: "border",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
    bordered: true,
  },
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
  bordered = false,
  ...props
}: TagProps) => {
  return (
    <div
      className={cn(
        tagVariants({
          variant,
          color,
          bordered,
        }),
        className,
      )}
      {...props}
    />
  );
};

export { Tag, tagVariants, color as tagColors };
export type { TagProps };
