"use client";

import type { ReactNode } from "react";

import type { AvatarImageProps, AvatarRootProps } from "@acme/ui/shadcn/avatar";
import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
} from "@acme/ui/shadcn/avatar";

export type AvatarProps = AvatarRootProps &
  AvatarImageProps & {
    fallback?: ReactNode;
    className?: string;
  };
export const Avatar = ({ fallback, size, src, alt, ...rest }: AvatarProps) => {
  const isShadcnAvatar = !src;
  if (isShadcnAvatar) return <AvatarRoot size={size} {...rest} />;

  return (
    <AvatarRoot size={size} {...rest}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </AvatarRoot>
  );
};
