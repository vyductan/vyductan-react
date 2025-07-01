import type { ReactNode } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { AlertRootProps } from "./_components";
import { Icon } from "../../icons";
import {
  AlertContent,
  AlertDescription,
  AlertMessage,
  AlertRoot,
} from "./_components";

type AlertProps = Omit<AlertRootProps, "title"> & {
  message?: ReactNode;
  description?: ReactNode;
  showIcon?: boolean;

  bordered?: boolean;
};
const Alert = ({
  message,
  description,

  className,
  showIcon,
  type,

  bordered = true,
}: AlertProps) => {
  const icon =
    type === "warning" ? (
      <Icon icon="icon-[mingcute--warning-line]" />
    ) : undefined;
  return (
    <AlertRoot type={type} bordered={bordered} className={cn(className)}>
      {showIcon && <span className="me-2">{icon}</span>}
      <AlertContent>
        {message && <AlertMessage>{message}</AlertMessage>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </AlertContent>
    </AlertRoot>
  );
};

export { Alert };
