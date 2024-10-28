import type { HTMLAttributes, ReactElement } from "react";
import { cloneElement } from "react";

import { cn } from "@acme/ui";

type IconWrapperProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactElement;
  srOnly?: string;
};
const IconWrapper = ({
  children,
  className,
  srOnly,
  ...props
}: IconWrapperProps) => {
  return (
    <>
      <span className={cn(className)} {...props}>
        {cloneElement(children, {
          className: cn("size-6", className),
          "aria-hidden": "true",
          role: "img",
          ...props,
        })}
      </span>
      {srOnly && <span className="sr-only">{srOnly}</span>}
    </>
  );
};

export type { IconWrapperProps };
export { IconWrapper };
