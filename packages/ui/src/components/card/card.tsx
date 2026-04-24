"use client";

import type { ReactElement, ReactNode } from "react";
import { Children, cloneElement, Fragment, isValidElement } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { CardRootProps as CardRootProperties } from "./_components";
import { Skeleton } from "../skeleton";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardRoot,
  CardTitle,
} from "./_components";
import { CardContext } from "./context";

type CardProperties = Omit<CardRootProperties, "title"> & {
  skeleton?: boolean;
  bordered?: boolean;
  variant?: "default" | "borderless";
  classNames?: {
    header?: string;
    title?: string;
    description?: string;
    content?: string;
    footer?: string;
  };

  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
};

const flattenCardChildren = (children: ReactNode): ReactElement[] => {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) {
      return [];
    }

    if (child.type === Fragment) {
      return flattenCardChildren(child.props.children);
    }

    return [child as ReactElement];
  });
};

const Card = ({
  skeleton = false,
  classNames,
  title,
  description,
  children,
  extra,
  footer,
  className,
  variant,
  bordered,

  ...properties
}: CardProperties) => {
  const composedChildren = Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode; className?: string }>(child)) {
      return child;
    }

    if (child.type === Fragment) {
      return cloneElement(child, {
        children: Children.map(child.props.children, (grandchild) => {
          if (!isValidElement<{ className?: string }>(grandchild)) {
            return grandchild;
          }

          if (grandchild.type === CardHeader) {
            return cloneElement(grandchild, {
              className: cn(grandchild.props.className, classNames?.header),
            });
          }

          if (grandchild.type === CardTitle) {
            return cloneElement(grandchild, {
              className: cn(grandchild.props.className, classNames?.title),
            });
          }

          if (grandchild.type === CardDescription) {
            return cloneElement(grandchild, {
              className: cn(grandchild.props.className, classNames?.description),
            });
          }

          if (grandchild.type === CardContent) {
            return cloneElement(grandchild, {
              className: cn(grandchild.props.className, classNames?.content),
            });
          }

          if (grandchild.type === CardFooter) {
            return cloneElement(grandchild, {
              className: cn(grandchild.props.className, classNames?.footer),
            });
          }

          return grandchild;
        }),
      });
    }

    if (child.type === CardHeader) {
      return cloneElement(child, {
        className: cn(child.props.className, classNames?.header),
      });
    }

    if (child.type === CardTitle) {
      return cloneElement(child, {
        className: cn(child.props.className, classNames?.title),
      });
    }

    if (child.type === CardDescription) {
      return cloneElement(child, {
        className: cn(child.props.className, classNames?.description),
      });
    }

    if (child.type === CardContent) {
      return cloneElement(child, {
        className: cn(child.props.className, classNames?.content),
      });
    }

    if (child.type === CardFooter) {
      return cloneElement(child, {
        className: cn(child.props.className, classNames?.footer),
      });
    }

    return child;
  });
  let CardRender = <></>;

  if (skeleton) {
    CardRender = (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  const isShadcnCard = flattenCardChildren(children).some(
    (child) =>
      child.type === CardContent ||
      child.type === CardHeader ||
      child.type === CardFooter ||
      child.type === CardTitle ||
      child.type === CardDescription,
  );

  const borderedToPass = variant === "borderless" ? false : bordered;

  if (isShadcnCard) {
    CardRender = (
      <CardRoot className={className} bordered={borderedToPass} {...properties}>
        {composedChildren}
      </CardRoot>
    );
  }

  if (!isShadcnCard) {
    const hasExtra = !!extra;

    CardRender = (
      <CardRoot className={className} bordered={borderedToPass} {...properties}>
        {(!!title || !!description || !!extra) && (
          <CardHeader
            className={cn(hasExtra && "items-center", classNames?.header)}
          >
            <CardTitle className={cn(classNames?.title)}>{title}</CardTitle>
            {description && (
              <CardDescription className={cn(classNames?.description)}>
                {description}
              </CardDescription>
            )}
            {extra && (
              <CardAction className={cn(hasExtra && "self-center")}>
                {extra}
              </CardAction>
            )}
          </CardHeader>
        )}
        <CardContent className={cn(classNames?.content)}>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className={classNames?.footer}>{footer}</CardFooter>
        )}
      </CardRoot>
    );
  }

  return (
    <CardContext.Provider value={{ size: properties.size }}>
      {CardRender}
    </CardContext.Provider>
  );
};

export type { CardProperties as CardProps };
export { Card };
