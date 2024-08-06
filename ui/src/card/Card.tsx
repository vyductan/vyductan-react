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
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  classNames?: {
    title?: string;
    description?: string;
  };
  extra?: ReactNode;
};
const Card = ({
  title,
  description,
  children,
  classNames,
  extra,
  ...props
}: CardProps) => {
  return (
    <CardRoot {...props}>
      {(!!title || !!description) && (
        <CardHeader>
          <div className="flex items-center">
            <CardTitle className={classNames?.title}>{title}</CardTitle>
            <div className="ml-auto">{extra}</div>
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
      <CardContent>{children}</CardContent>
    </CardRoot>
  );
};

export { Card };
