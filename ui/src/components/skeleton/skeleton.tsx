/* eslint-disable unicorn/prefer-ternary */
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@acme/ui/lib/utils";
import { Skeleton as SkeletonShadcn } from "@acme/ui/shadcn/skeleton";

import type { SkeletonAvatarProps } from "./_components/skeleton-avatar";
import type { SkeletonParagraphProps } from "./_components/skeleton-paragraph";
import type { SkeletonTitleProps } from "./_components/skeleton-title";
import { useComponentConfig } from "../config-provider/context";
import { SkeletonElement } from "./_components/element";
import { SkeletonParagraph } from "./_components/skeleton-paragraph";
import { SkeletonTitle } from "./_components/skeleton-title";

interface SkeletonProps {
  asChild?: boolean;
  className?: string;
  rootClassName?: string;
  style?: React.CSSProperties;
  /** Show animation effect */
  active?: boolean;
  /** Display the skeleton when true */
  loading?: boolean;
  /** Show avatar placeholder */
  avatar?: SkeletonAvatarProps | boolean;
  /** Show title placeholder */
  title?: SkeletonTitleProps | boolean;
  /** Show paragraph placeholder */
  paragraph?: SkeletonParagraphProps | boolean;
  /**Show paragraph and title radius when true */
  round?: boolean;
}

function Skeleton(props: SkeletonProps) {
  const {
    asChild,
    className,
    rootClassName,
    style,
    active,
    loading,
    round,

    avatar,
    title,
    paragraph,
    ...restProps
  } = props;
  const {
    direction,
    className: contextClassName,
    style: contextStyle,
  } = useComponentConfig("skeleton");
  const SkeletonComp = asChild ? Slot : SkeletonShadcn;

  if (loading || !("loading" in props)) {
    const hasAvatar = !!avatar;
    const hasTitle = !!title;
    const hasParagraph = !!paragraph;

    // Avatar
    let avatarNode: React.ReactNode;
    if (hasAvatar) {
      const avatarProps: SkeletonAvatarProps = {
        ...getAvatarBasicProps(hasTitle, hasParagraph),
        ...getComponentProps(avatar),
      };
      // We direct use SkeletonElement as avatar in skeleton internal.
      avatarNode = <SkeletonElement {...avatarProps} />;
    }

    let contentNode: React.ReactNode;
    if (hasTitle || hasParagraph) {
      // Title
      let $title: React.ReactNode;
      if (hasTitle) {
        const titleProps: SkeletonTitleProps = {
          ...getTitleBasicProps(hasAvatar, hasParagraph),
          ...getComponentProps(title),
        };

        $title = <SkeletonTitle {...titleProps} />;
      }

      // Paragraph
      let paragraphNode: React.ReactNode;
      if (hasParagraph) {
        const paragraphProps: SkeletonParagraphProps = {
          ...getParagraphBasicProps(hasAvatar, hasTitle),
          ...getComponentProps(paragraph),
        };

        paragraphNode = <SkeletonParagraph {...paragraphProps} />;
      }

      contentNode = (
        <div>
          {$title}
          {paragraphNode}
        </div>
      );
    }

    const cls = cn(
      {
        [`with-avatar`]: hasAvatar,
        [`active`]: active,
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

  return (
    <SkeletonComp className={cn("h-4 w-full", className)} {...restProps} />
  );
}

export { Skeleton };

function getComponentProps<T>(prop?: T | boolean): T | Record<string, string> {
  if (prop && typeof prop === "object") {
    return prop;
  }
  return {};
}

function getAvatarBasicProps(
  hasTitle: boolean,
  hasParagraph: boolean,
): SkeletonAvatarProps {
  if (hasTitle && !hasParagraph) {
    // Square avatar
    return { size: "large", shape: "square" };
  }

  return { size: "large", shape: "circle" };
}
function getTitleBasicProps(
  hasAvatar: boolean,
  hasParagraph: boolean,
): SkeletonTitleProps {
  if (!hasAvatar && hasParagraph) {
    return { width: "38%" };
  }

  if (hasAvatar && hasParagraph) {
    return { width: "50%" };
  }

  return {};
}

function getParagraphBasicProps(
  hasAvatar: boolean,
  hasTitle: boolean,
): SkeletonParagraphProps {
  const basicProps: SkeletonParagraphProps = {};

  // Width
  if (!hasAvatar || !hasTitle) {
    basicProps.width = "61%";
  }

  // Rows
  if (!hasAvatar && hasTitle) {
    basicProps.rows = 3;
  } else {
    basicProps.rows = 2;
  }

  return basicProps;
}
