import type { ReactNode } from "react";

import { cn } from "@acme/ui/lib/utils";

import type {
  AlertType,
  ShadcnAlertProps as ShadcnAlertProperties,
} from "./_components";
import { Icon } from "../../icons";
import {
  AlertContent,
  AlertDescription,
  AlertTitle,
  alertVariants,
  ShadcnAlert,
} from "./_components";

type AlertProperties = Omit<ShadcnAlertProperties, "title"> & {
  type?: AlertType;
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
}: AlertProperties) => {
  const icon =
    type === "warning" ? (
      <Icon icon="icon-[mingcute--warning-line]" />
    ) : undefined;
  return (
    <ShadcnAlert
      className={cn(alertVariants({ type, bordered }), "space-y-1", className)}
    >
      {showIcon && <span className="me-2">{icon}</span>}
      <AlertContent>
        {message && (
          <AlertTitle className="line-clamp-none">{message}</AlertTitle>
        )}
        {description && <AlertDescription>{description}</AlertDescription>}
      </AlertContent>
    </ShadcnAlert>
  );
};

export type { AlertProperties as AlertProps };
export { Alert };
