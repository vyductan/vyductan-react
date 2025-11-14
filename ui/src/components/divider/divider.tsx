"use client";

import { cn } from "@/lib/utils";

import { Separator } from "@acme/ui/shadcn/separator";

type ShadcnSeparatorProps = React.ComponentProps<typeof Separator>;
type DividerProps = Omit<
  React.ComponentProps<typeof Separator>,
  "orientation"
> & {
  orientation?:
    | "start"
    | "end"
    | "center"
    | ShadcnSeparatorProps["orientation"];
  type?: "horizontal" | "vertical";
  plain?: boolean;
  size?: "small" | "middle" | "large";
  dashed?: boolean;
};
const Divider = ({
  orientation,
  children,
  className,
  type = "horizontal",
  plain,
  size = "large",
  dashed = false,
  ...props
}: DividerProps) => {
  const sizeClasses = {
    small: "my-2",
    middle: "my-4",
    large: "my-6",
  };

  const classes = cn(
    "self-stretch",
    type === "vertical" && "inline-block mx-2 min-h-[0.9em]",
    (type === "horizontal" || orientation === "horizontal") &&
      sizeClasses[size],
    (type === "horizontal" || orientation === "horizontal") &&
      children &&
      "grow basis-0",
    dashed &&
      "text-border bg-transparent bg-[repeating-linear-gradient(to_right,currentColor_0_4px,transparent_4px_8px)]",
    className,
  );
  if (!children || orientation === "horizontal" || orientation === "vertical") {
    return (
      <Separator
        orientation={
          (orientation as "horizontal" | "vertical" | undefined) ?? type
        }
        className={cn(classes, className)}
        {...props}
      />
    );
  }
  return (
    <div className={cn("flex items-center", className)}>
      <Separator
        orientation={type}
        className={cn(
          classes,
          orientation === "start" && "data-[orientation=horizontal]:max-w-[5%]",
        )}
      />
      <div
        className={cn(
          "mb-px px-4 text-base font-medium",
          plain && "text-sm font-normal",
        )}
      >
        {children}
      </div>
      <Separator
        orientation={type}
        className={cn(
          classes,
          orientation === "end" && "data-[orientation=horizontal]:max-w-[5%]",
        )}
      />
    </div>
  );
};

export { Divider };

export { Separator } from "@acme/ui/shadcn/separator";
