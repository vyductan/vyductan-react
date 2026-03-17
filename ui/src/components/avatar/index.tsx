import type { XOR } from "ts-xor";
import React from "react";

import {
  AvatarFallback,
  AvatarImage,
  Avatar as ShadcnAvatar,
} from "@acme/ui/shadcn/avatar";

import type { OwnAvatarProps } from "./avatar";
import { InternalAvatar } from "./avatar";

type ShadcnAvatarProps = React.ComponentProps<typeof ShadcnAvatar>;
type AvatarProps = XOR<OwnAvatarProps, ShadcnAvatarProps>;

const Avatar = (props: AvatarProps) => {
  const isAvatarShadcn = React.Children.toArray(props.children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === AvatarImage || child.type === AvatarFallback),
  );

  if (isAvatarShadcn) {
    const { size, ...rest } = props as OwnAvatarProps;
    let shadcnSize: "default" | "sm" | "lg" | undefined;

    switch (size) {
      case "small": {
        shadcnSize = "sm";
        break;
      }
      case "large": {
        shadcnSize = "lg";
        break;
      }
      case "default": {
        shadcnSize = "default";
        break;
      }
      default: {
        shadcnSize = undefined;
      }
    } // Fallback or handle number? Shadcn doesn't support number directly

    return <ShadcnAvatar size={shadcnSize} {...(rest as ShadcnAvatarProps)} />;
  }

  return <InternalAvatar {...(props as OwnAvatarProps)} />;
};

export type { AvatarProps };
export { Avatar };

export { type OwnAvatarProps } from "./avatar";
export * from "./_components";
