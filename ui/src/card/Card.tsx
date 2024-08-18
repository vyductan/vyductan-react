import type { ReactNode } from "react";

import type { CardRootProps } from "./_components";
import { clsm } from "..";
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
  children: ReactNode;
  extra?: ReactNode;
};
const Card = ({
  classNames,
  bordered,
  className,
  title,
  description,
  children,
  extra,
  ...props
}: CardProps) => {
  return (
    <CardRoot
      className={clsm(!bordered ? "border-none" : "", className)}
      {...props}
    >
      {(!!title || !!description) && (
        <CardHeader>
          <div className="flex items-center">
            <CardTitle className={classNames?.title}>{title}</CardTitle>
            {extra && <div className="ml-auto">{extra}</div>}
          </div>
          <CardDescription
            className={clsm(
              description ? "" : "hidden",
              classNames?.description,
            )}
          >
            {description}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={classNames?.content}>{children}</CardContent>
    </CardRoot>
  );
};

export { Card };
