import type { XOR } from "ts-xor";
import React from "react";

import type { BadgeProps as ShadcnBadgeProps } from "@acme/ui/shadcn/badge";
import {
  AvatarFallback,
  AvatarImage,
  Avatar as ShadcnAvatar,
} from "@acme/ui/shadcn/avatar";

import type { OwnAvatarProps } from "./avatar";
import { InternalAvatar } from "./avatar";

type AvatarProps = XOR<OwnAvatarProps, ShadcnBadgeProps>;
const Avatar = (props: AvatarProps) => {
  const isAvatarShadcn = React.Children.toArray(props.children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === AvatarImage || child.type === AvatarFallback),
  );

  if (isAvatarShadcn) return <ShadcnAvatar {...props} />;

  return <InternalAvatar {...props} />;
};

export type { AvatarProps };
export { Avatar };

export { type OwnAvatarProps } from "./avatar";
export * from "./_components";
