"use client";

import type { ReactNode } from "react";

import type { AvatarImageProps, AvatarRootProps } from "./_components";
import { AvatarFallback, AvatarImage, AvatarRoot } from "./_components";

export type AvatarProps = AvatarRootProps &
  AvatarImageProps & {
    fallback?: ReactNode;
    className?: string;
  };
export const Avatar = ({ fallback, className, size, ...rest }: AvatarProps) => {
  return (
    <AvatarRoot size={size} className={className}>
      <AvatarImage {...rest} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </AvatarRoot>
  );
};
