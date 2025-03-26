"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import type { SizeType } from "../types";
import { cn } from "..";

type AvatarRootProps = React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: SizeType | number;
};
function AvatarRoot({ className, size, ...props }: AvatarRootProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        size === "sm" && "size-6 text-xs",
        size === "lg" && "size-10 text-lg",
        size === "xl" && "size-16 text-[1.25rem] leading-[4rem]",
        className,
      )}
      {...props}
    />
  );
}

type AvatarImageProps = React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Image
>;
function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export type { AvatarRootProps, AvatarImageProps };
export { AvatarRoot, AvatarImage, AvatarFallback };
