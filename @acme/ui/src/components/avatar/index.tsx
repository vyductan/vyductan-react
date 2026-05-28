import type { XOR } from "ts-xor";
import React from "react";

import {
  AvatarFallback,
  AvatarImage,
  Avatar as ShadcnAvatar,
} from "@acme/ui/shadcn/avatar";

import type { OwnAvatarProps as OwnAvatarProperties } from "./avatar";
import { InternalAvatar } from "./avatar";

type ShadcnAvatarProperties = React.ComponentProps<typeof ShadcnAvatar>;
type AvatarProperties = XOR<OwnAvatarProperties, ShadcnAvatarProperties>;

const Avatar = (properties: AvatarProperties) => {
  const isAvatarShadcn = React.Children.toArray(properties.children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === AvatarImage || child.type === AvatarFallback),
  );

  if (isAvatarShadcn) {
    const { size, ...rest } = properties as OwnAvatarProperties;
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

    return (
      <ShadcnAvatar size={shadcnSize} {...(rest as ShadcnAvatarProperties)} />
    );
  }

  return <InternalAvatar {...(properties as OwnAvatarProperties)} />;
};

export type { AvatarProperties as AvatarProps };
export { Avatar };

export { type OwnAvatarProps } from "./avatar";
export * from "./_components";
