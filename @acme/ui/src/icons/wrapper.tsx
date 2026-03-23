import type { HTMLAttributes, ReactElement } from "react";
import { cloneElement } from "react";

import { cn } from "@acme/ui/lib/utils";

type IconWrapperProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: ReactElement<any>;
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
      <span role="img" className={cn("size-4", className)} {...props}>
        {cloneElement(children, {
          "aria-hidden": "true",
          style: {
            width: "100%",
            height: "100%",
          },
          ...props,
        })}
      </span>
      {srOnly && <span className="sr-only">{srOnly}</span>}
    </>
  );
};

export type { IconWrapperProps };
export { IconWrapper };
