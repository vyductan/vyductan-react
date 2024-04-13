"use client";

import type { AvatarImageProps } from "@radix-ui/react-avatar";
import type { ReactNode } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { clsm } from "@acme/ui";

export type AvatarProps = AvatarImageProps & {
  fallback?: ReactNode;
  className?: string;
  asChild?: AvatarPrimitive.AvatarProps["asChild"];
};
export const Avatar = ({ fallback, className, ...rest }: AvatarProps) => {
  return (
    <AvatarPrimitive.Root
      className={clsm(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      <AvatarPrimitive.Image
        className={clsm("aspect-square size-full")}
        {...rest}
      />
      <AvatarPrimitive.Fallback
        className={clsm(
          "flex size-full items-center justify-center rounded-full bg-primary text-white dark:bg-primary",
        )}
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};
