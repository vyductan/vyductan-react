"use client";

import type { ReactNode } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type { AvatarImageProps } from "@radix-ui/react-avatar";

import { clsm } from "@vyductan/utils";

export type AvatarProps = AvatarImageProps & {
  fallback?: ReactNode;
  className?: string;
  asChild?: AvatarPrimitive.AvatarProps["asChild"];
};
export const Avatar = ({ fallback, className, ...rest }: AvatarProps) => {
  return (
    <AvatarPrimitive.Root
      className={clsm(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      <AvatarPrimitive.Image
        className={clsm("aspect-square h-full w-full")}
        {...rest}
      />
      <AvatarPrimitive.Fallback
        className={clsm(
          "flex h-full w-full items-center justify-center rounded-full bg-primary text-white dark:bg-primary",
        )}
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};
