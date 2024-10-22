import type { HTMLAttributes, ReactElement } from "react";
import { cloneElement } from "react";

import { clsm } from "@acme/ui";

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
      <span className={clsm(className)} {...props}>
        {cloneElement(children, {
          className: clsm("size-6", className),
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
