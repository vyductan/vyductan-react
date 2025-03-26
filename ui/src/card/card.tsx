import type { ReactNode } from "react";

import type { CardRootProps } from "./_components";
import { cn } from "..";
import { Skeleton } from "../skeleton";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardRoot,
  CardTitle,
} from "./_components";

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
  bordered = true,
  className,
  classNames,
  title,
  description,
  children,
  extra,
  footer,

  size = "default",
  ...props
}: CardProps) => {
  if (skeleton) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }
  return (
    <CardRoot
      size={size}
      className={cn(bordered ? "" : "border-none", className)}
      {...props}
    >
      {(!!title || !!description || !!extra) && (
        <CardHeader className={cn(classNames?.header)}>
          <div className="flex items-center">
            <CardTitle className={cn(classNames?.title)}>{title}</CardTitle>
            {extra && <div className="ml-auto">{extra}</div>}
          </div>
          {description && (
            <CardDescription className={cn(classNames?.description)}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent size={size} className={classNames?.content}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter size={size} className={classNames?.footer}>
          {footer}
        </CardFooter>
      )}
    </CardRoot>
  );
};

export type { CardProps };
export { Card };
