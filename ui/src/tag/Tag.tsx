import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cva } from "class-variance-authority";

import { clsm } from "..";

const tagVariants = cva(
  "inline-flex justify-center items-center rounded border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: [
          "border-transparent text-primary-foreground",
          "whitespace-nowrap",
        ],
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
      color_variant: {
        default: "bg-gray-200 text-gray-950",
        success: "bg-success-bg text-success",
        processing: "bg-blue-200 text-blue-900",
        error: "bg-red-200 text-red-900",
        warning: "bg-amber-200 text-amber-900",
        amber: "bg-amber-200 text-amber-900",
        blue: "bg-blue-200 text-blue-900",
        green: "bg-green-200 text-green-900",
        red: "bg-red-200 text-red-900",
        pink: "bg-pink-300 text-pink-900",
        purple: "bg-purple-200 text-purple-900",
        teal: "bg-teal-300 text-teal-900",
      },
      bordered: {
        true: "border",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      color_variant: "default",
      bordered: true,
    },
  },
);

interface TagProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    Omit<VariantProps<typeof tagVariants>, "color_variant"> {
  color?: string | null;
}

const Tag = ({ className, variant, color, ...props }: TagProps) => {
  return (
    <div
      className={clsm(
        tagVariants({
          variant,
          color_variant: color as VariantProps<
            typeof tagVariants
          >["color_variant"],
        }),
        className,
        "text-xs",
      )}
      {...props}
    />
  );
};

export { Tag, tagVariants };
export type { TagProps };
