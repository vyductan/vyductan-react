import type { ReactNode } from "react";

import type { CardRootProps } from "./_components";
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
};
const Card = ({
  title,
  description,
  children,
  classNames,
  ...props
}: CardProps) => {
  return (
    <CardRoot {...props}>
      {(!!title || !!description) && (
        <CardHeader>
          <CardTitle className={classNames?.title}>{title}</CardTitle>
          <CardDescription className={classNames?.description}>
            {description}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </CardRoot>
  );
};

export { Card };
