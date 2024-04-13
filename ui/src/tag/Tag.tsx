import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cva } from "class-variance-authority";

import { clsm } from "@acme/ui";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
      color: {
        default: "",
        success: "",
        processing: "",
        error: "",
        warning: "",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "default",
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
