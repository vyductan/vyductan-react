import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { tv } from "tailwind-variants";

import { clsm } from "..";

const color: Record<string, string> = {
  default: "bg-gray-200 text-gray-950",
  gray: "bg-gray-200 text-gray-950 hover:border-gray-500 focus-within:border-gray-600 focus-within:ring-gray-100",
  success: "bg-success-muted text-success",
  processing:
    "bg-blue-200 text-blue-900 hover:border-blue-500 focus-within:border-blue-600 focus-within:ring-blue-100",
  error: "bg-red-200 text-red-900",
  warning: "bg-amber-200 text-amber-900",
  amber: "bg-amber-200 text-amber-900",
  blue: "bg-blue-200 text-blue-900",
  green:
    "bg-green-200 text-green-900 hover:border-green-500 focus-within:border-green-600 focus-within:ring-green-100",
  red: "bg-red-200 text-red-900",
  pink: "bg-pink-300 text-pink-900 hover:border-pink-500 focus-within:border-pink-600 focus-within:ring-pink-100",
  purple: "bg-purple-200 text-purple-900",
  teal: "bg-teal-300 text-teal-900 hover:border-teal-500 focus-within:border-teal-600 focus-within:ring-teal-100",
};
const tagVariants = tv({
  base: [
    "text-xs",
    "inline-flex items-center justify-center rounded border px-2.5 py-0.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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

const Tag = ({ className, variant, color, ...props }: TagProps) => {
  return (
    <div
      className={clsm(
        tagVariants({
          variant,
          color,
        }),
        className,
      )}
      {...props}
    />
  );
};

export { Tag, tagVariants, color as tagColors };
export type { TagProps };
