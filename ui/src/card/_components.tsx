import * as React from "react";

import type { SizeType } from "../types";
import { cn } from "..";

type CardRootProps = React.ComponentProps<"div"> & {
  size?: SizeType;
};
function CardRoot({ className, size, ...props }: CardRootProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        size === "sm" && "gap-3 py-3",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & {
  size?: SizeType;
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 px-6",
        size === "sm" && "px-3",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "leading-none font-semibold",
        "flex-1", // fix if not has extra the title width not full
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & {
  size?: SizeType;
}) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", size === "sm" && "px-3", className)}
      {...props}
    />
  );
}

function CardFooter({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & {
  size?: SizeType;
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6",
        size === "sm" && "px-3",
        className,
      )}
      {...props}
    />
  );
}

export type { CardRootProps };

export {
  CardRoot,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
