import type { ReactNode } from "react";

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

type CardProps = CardRootProps & {
  skeleton?: boolean;
  bordered?: boolean;
  classNames?: {
    title?: string;
    description?: string;
    content?: string;
  };

  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  size?: "default" | "sm";
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
        <CardHeader>
          <div className="flex items-center">
            <CardTitle className={classNames?.title}>{title}</CardTitle>
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
          !title && !description && !extra && "pt-6",
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
