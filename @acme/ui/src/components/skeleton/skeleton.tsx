import type { Key } from "react";

import { cn } from "@acme/ui/lib/utils";
import { Skeleton as SkeletonShadcn } from "@acme/ui/shadcn/skeleton";

import type { SkeletonAvatarProps as SkeletonAvatarProperties } from "./_components/skeleton-avatar";
import type { SkeletonParagraphProps as SkeletonParagraphProperties } from "./_components/skeleton-paragraph";
import type { SkeletonTitleProps as SkeletonTitleProperties } from "./_components/skeleton-title";
import { useComponentConfig } from "../config-provider/context";
import { GenericSlot } from "../slot";
import { SkeletonElement } from "./_components/element";
import { SkeletonParagraph } from "./_components/skeleton-paragraph";
import { SkeletonTitle } from "./_components/skeleton-title";

interface SkeletonProperties {
  key?: Key;
  asChild?: boolean;
  // children?: React.ReactNode;
  className?: string;
  rootClassName?: string;
  style?: React.CSSProperties;
  /** Show animation effect */
  active?: boolean;
  /** Display the skeleton when true */
  loading?: boolean;
  /** Show avatar placeholder */
  avatar?: SkeletonAvatarProperties | boolean;
  /** Show title placeholder */
  title?: SkeletonTitleProperties | boolean;
  /** Show paragraph placeholder */
  paragraph?: SkeletonParagraphProperties | boolean;
  /**Show paragraph and title radius when true */
  round?: boolean;
}

function Skeleton(properties: SkeletonProperties) {
  const {
    asChild,
    className,
    rootClassName,
    style,
    loading,
    round,

    active,
    avatar = false,
    title = true,
    paragraph = true,
    ...restProperties
  } = properties;
  const {
    direction,
    className: contextClassName,
    style: contextStyle,
  } = useComponentConfig("skeleton");
  const SkeletonComp = asChild ? GenericSlot : SkeletonShadcn;

  if (loading || !("loading" in properties)) {
    const hasAvatar = !!avatar;
    const hasTitle = !!title;
    const hasParagraph = !!paragraph;

    // Avatar
    let avatarNode: React.ReactNode;
    if (hasAvatar) {
      const avatarProperties: SkeletonAvatarProperties = {
        ...getAvatarBasicProperties(hasTitle, hasParagraph),
        ...getComponentProperties(avatar),
      };
      // We direct use SkeletonElement as avatar in skeleton internal.
      avatarNode = (
        <div data-slot="skeleton-header" className="table-cell pe-4 align-top">
          <SkeletonElement active={active} {...avatarProperties} />
        </div>
      );
    }

    let contentNode: React.ReactNode;
    if (hasTitle || hasParagraph) {
      // Title
      let $title: React.ReactNode;
      if (hasTitle) {
        const titleProperties: SkeletonTitleProperties = {
          active,
          ...getTitleBasicProperties(hasAvatar, hasParagraph),
          ...getComponentProperties(title),
        };

        $title = <SkeletonTitle className="mt-3" {...titleProperties} />;
      }

      // Paragraph
      let paragraphNode: React.ReactNode;
      if (hasParagraph) {
        const paragraphProperties: SkeletonParagraphProperties = {
          ...getParagraphBasicProperties(hasAvatar, hasTitle),
          ...getComponentProperties(paragraph),
        };

        paragraphNode = (
          <SkeletonParagraph
            active={active}
            {...paragraphProperties}
            className="mt-7"
          />
        );
      }

      contentNode = (
        <div
          data-slot="skeleton-content"
          className="table-cell w-full align-top"
        >
          {$title}
          {paragraphNode}
        </div>
      );
    }

    const cls = cn(
      {
        [`with-avatar`]: hasAvatar,
        // [`active`]: active,
        [`rtl`]: direction === "rtl",
        [`round`]: round,
      },
      contextClassName,
      className,
      rootClassName,
    );

    return (
      <div className={cls} style={{ ...contextStyle, ...style }}>
        {avatarNode}
        {contentNode}
      </div>
    );
  }

  // if (avatar) {
  //   const avatarProps = typeof avatar === "boolean" ? {} : avatar;
  //   return <SkeletonAvatar {...avatarProps} />;
  // }

  return <SkeletonComp className={cn(className)} {...restProperties} />;
}

export type { SkeletonProperties as SkeletonProps };
export { Skeleton };

function getComponentProperties<T>(
  property?: T | boolean,
): T | Record<string, string> {
  if (property && typeof property === "object") {
    return property;
  }
  return {};
}

function getAvatarBasicProperties(
  hasTitle: boolean,
  hasParagraph: boolean,
): SkeletonAvatarProperties {
  if (hasTitle && !hasParagraph) {
    // Square avatar
    return { size: "large", shape: "square" };
  }

  return { size: "large", shape: "circle" };
}
function getTitleBasicProperties(
  hasAvatar: boolean,
  hasParagraph: boolean,
): SkeletonTitleProperties {
  if (!hasAvatar && hasParagraph) {
    return { width: "38%" };
  }

  if (hasAvatar && hasParagraph) {
    return { width: "50%" };
  }

  return {};
}

function getParagraphBasicProperties(
  hasAvatar: boolean,
  hasTitle: boolean,
): SkeletonParagraphProperties {
  const basicProperties: SkeletonParagraphProperties = {};

  // Width
  if (!hasAvatar || !hasTitle) {
    basicProperties.width = "61%";
  }

  // Rows
  if (!hasAvatar && hasTitle) {
    basicProperties.rows = 3;
  } else {
    basicProperties.rows = 2;
  }

  return basicProperties;
}
