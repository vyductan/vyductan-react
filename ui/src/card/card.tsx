import type { ReactNode } from "react";

import type { CardRootProps } from "./_components";
import { cn } from "..";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardRoot,
  CardTitle,
} from "./_components";

type CardProps = CardRootProps & {
  classNames?: {
    title?: string;
    description?: string;
    content?: string;
  };
  bordered?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  size?: "default" | "sm";
};
const Card = ({
  classNames,
  bordered = true,
  className,
  title,
  description,
  children,
  extra,
  size = "default",
  ...props
}: CardProps) => {
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
          <CardDescription
            className={cn(description ? "" : "hidden", classNames?.description)}
          >
            {description}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent
        className={cn(
          classNames?.content,
          (!!title || !!description || !!extra) && "pt-0 lg:pt-0",
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
