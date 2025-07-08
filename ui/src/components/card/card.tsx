import type { ReactNode } from "react";
import React, { Children, isValidElement } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { CardRootProps } from "./_components";
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

type CardProps = Omit<CardRootProps, "title"> & {
  skeleton?: boolean;
  bordered?: boolean;
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
const Card = ({
  skeleton = false,
  classNames,
  title,
  description,
  children,
  extra,
  footer,
  className,

  ...props
}: CardProps) => {
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

  const isShadcnCard = Children.toArray(children).some((child) => {
    if (isValidElement(child)) {
      const type =
        typeof child.type === "string" ? child.type : child.type.name;
      return (
        type === "CardContent" ||
        type === "CardHeader" ||
        type === "CardFooter" ||
        type === "CardTitle" ||
        type === "CardDescription"
      );
    }
    return false;
  });

  if (isShadcnCard) {
    CardRender = (
      <CardRoot className={className} {...props}>
        {children}
      </CardRoot>
    );
  }

  if (!isShadcnCard) {
    const hasExtra = !!extra;

    CardRender = (
      <CardRoot className={className} {...props}>
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
    <CardContext.Provider value={{ size: props.size }}>
      {CardRender}
    </CardContext.Provider>
  );
};

export type { CardProps };
export { Card };
