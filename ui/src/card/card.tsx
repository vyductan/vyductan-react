import type { ReactNode } from "react";

import type { SizeType } from "../types";
import type { CardRootProps } from "./_components";
import { cn } from "..";
import { Skeleton } from "../skeleton";
import {
  CardContent,
  CardDescription,
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
  };

  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  size?: SizeType;
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
      className={cn(bordered ? "" : "border-none", className)}
      {...props}
    >
      {(!!title || !!description || !!extra) && (
        <CardHeader className={cn(size === "sm" && "p-3", classNames?.header)}>
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
      <CardContent
        className={cn(
          !title &&
            !description &&
            !extra &&
            cn(size === "default" ? "pt-6" : "pt-3"),
          classNames?.content,
        )}
        size={size}
      >
        {children}
      </CardContent>
    </CardRoot>
  );
};

export type { CardProps };
export { Card };
