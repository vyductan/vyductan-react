import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cva } from "class-variance-authority";

import { clsm } from "..";

const badgeVariants = cva(
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
      color: {
        default: "bg-gray-200 text-gray-950",
        success: "bg-success-bg text-success",
        processing: "",
        error: "",
        warning: "",
        blue: "bg-blue-200 text-blue-900",
        green: "bg-green-200 text-green-900",
        teal: "bg-teal-300 text-teal-900",
      },
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
  },
);

interface TagProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof badgeVariants> {}

const Tag = ({ className, variant, color, ...props }: TagProps) => {
  return (
    <div
      className={clsm(badgeVariants({ variant, color }), className, "text-xs")}
      {...props}
    />
  );
};

export { Tag, badgeVariants };
export type { TagProps };
