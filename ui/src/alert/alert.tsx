import type { ReactNode } from "react";

import type { AlertRootProps } from "./_components";
import { cn } from "..";
import { Icon } from "../icons";
import { AlertDescription, AlertRoot, AlertTitle } from "./_components";

type AlertProps = Omit<AlertRootProps, "title"> & {
  title?: ReactNode;
  message?: ReactNode;
  showIcon?: boolean;

  bordered?: boolean;
  classNames?: {
    title?: string;
  };
};
const Alert = ({
  title,
  message,
  className,
  showIcon,
  type,

  bordered = true,
  classNames,
}: AlertProps) => {
  const icon =
    type === "warning" ? (
      <Icon icon="icon-[mingcute--warning-line]" />
    ) : undefined;
  return (
    <AlertRoot type={type} bordered={bordered} className={cn(className)}>
      {showIcon && <span className="me-2">{icon}</span>}
      {title && <AlertTitle className={classNames?.title}>{title}</AlertTitle>}
      {message && <AlertDescription>{message}</AlertDescription>}
    </AlertRoot>
  );
};

export { Alert };
