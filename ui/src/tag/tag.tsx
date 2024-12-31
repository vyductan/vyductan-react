import type { VariantProps } from "class-variance-authority";
import { tv } from "tailwind-variants";

import { cn } from "..";
import { useUi } from "../store";

const color: Record<string, string> = {
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
    "inline-flex items-center justify-center rounded-sm border px-2.5 py-0.5 text-xs font-medium transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "h-[22px] whitespace-nowrap",
  ],
  variants: {
    variant: {
      default: "border-transparent",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground",
    },
    color,
    borderless: {
      true: "border-transparent",
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
  borderless: borderlessProp = false,
  ...props
}: TagProps) => {
  const tagConfig = useUi((state) => state.componentConfig.tag);

  return (
    <div
      className={cn(
        tagVariants({
          variant,
          color,
          borderless: borderlessProp || tagConfig?.borderless,
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
