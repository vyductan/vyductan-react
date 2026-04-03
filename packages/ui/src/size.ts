import { cva } from "class-variance-authority";

export const controlHeightVariants = cva("", {
  variants: {
    size: {
      sm: "h-6",
      default: "h-8",
      lg: "h-10",
      xl: "h-12",
    },
  },
});
