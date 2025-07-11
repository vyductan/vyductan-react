"use client";

import type { ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";

import type { Breakpoint } from "../_util/responsive-observer";
import type { AvatarContextType, AvatarSize } from "./avatar-context";
import { responsiveArray } from "../_util/responsive-observer";
import { ConfigContext } from "../config-provider";
import useSize from "../config-provider/hooks/use-size";
import useBreakpoint from "../grid/hooks/use-breakpoint";
import { AvatarFallback, AvatarImage, AvatarRoot } from "./_components";
import AvatarContext from "./avatar-context";

export type OwnAvatarProps = {
  /** The address of the image for an image avatar or image element */
  src?: React.ReactNode;
  /** A list of sources to use for different screen resolutions */
  srcSet?: string;
  /** This attribute defines the alternative text describing the image */
  alt?: string;
  /** Custom icon type for an icon avatar */
  icon?: React.ReactNode;
  /** Custom fallback type for an icon avatar */
  children?: React.ReactNode;

  /** The size of the avatar */
  size?: AvatarSize;

  fallback?: ReactNode;

  style?: React.CSSProperties;
  className?: string;
};
export const InternalAvatar = (props: OwnAvatarProps) => {
  const {
    size: customSize,
    src,
    alt,
    icon,
    children,
    style,
    className,
    ...rest
  } = props;
  const { avatar } = React.useContext(ConfigContext);

  const avatarCtx = React.useContext<AvatarContextType>(AvatarContext);

  const size = useSize(
    (ctxSize) => customSize ?? avatarCtx.size ?? ctxSize ?? "default",
  );

  const needResponsive = Object.keys(typeof size === "object" ? size : {}).some(
    (key) => ["xs", "sm", "md", "lg", "xl", "xxl"].includes(key),
  );
  const screens = useBreakpoint(needResponsive);
  const responsiveSizeStyle = React.useMemo<React.CSSProperties>(() => {
    if (typeof size !== "object") {
      return {};
    }

    const currentBreakpoint: Breakpoint = responsiveArray.find(
      (screen) => screens[screen],
    )!;

    const currentSize = size[currentBreakpoint];

    return currentSize
      ? {
          width: currentSize,
          height: currentSize,
          fontSize: currentSize && (icon || children) ? currentSize / 2 : 18,
        }
      : {};
  }, [screens, size, icon, children]);

  const sizeStyle: React.CSSProperties =
    typeof size === "number"
      ? {
          width: size,
          height: size,
          fontSize: icon ? size / 2 : 18,
        }
      : {};
  const sizeCls = cn(
    size === "small" && "size-6 text-xs",
    size === "large" && "size-10 text-lg",
    size === "default" && "size-16 text-[1.25rem] leading-[4rem]",
  );
  const classString = cn(sizeCls, avatar?.className, className);

  // Get fallback content with priority: icon > children > first letter of alt/src
  const getFallbackContent = (): ReactNode => {
    // If src is not a string (e.g., ReactNode), use it directly
    if (src !== undefined && typeof src !== "string") {
      return src;
    }

    // Priority 1: Use icon if provided
    if (icon) {
      return icon;
    }

    // Priority 2: Use children if provided
    if (children) {
      return children;
    }

    // Priority 3: Use first letter of alt or src
    if (alt) {
      return alt.charAt(0).toUpperCase();
    }

    if (typeof src === "string") {
      // Extract filename without extension and get first character
      const fileName = src.split(/[\\/]/).pop()?.split(".")[0] ?? "";
      return fileName.charAt(0).toUpperCase();
    }

    return null;
  };

  const fallback = getFallbackContent();
  return (
    <AvatarRoot
      style={{
        ...sizeStyle,
        ...responsiveSizeStyle,
        ...avatar?.style,
        ...style,
      }}
      className={classString}
      {...rest}
    >
      {typeof src === "string" && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </AvatarRoot>
  );
};
