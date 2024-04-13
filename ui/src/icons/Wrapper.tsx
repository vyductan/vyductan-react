import type { HTMLAttributes, ReactElement } from "react";
import { cloneElement } from "react";

import { clsm } from "@acme/ui";

export type IconWrapperProps = Omit<
  HTMLAttributes<SVGSVGElement>,
  "children"
> & {
  children: ReactElement;
};
const IconWrapper = ({
  children,
  className = "",
  ...props
}: IconWrapperProps) => {
  return cloneElement(children, {
    className: clsm("size-6", className),
    "aria-hidden": "true",
    role: "img",
    ...props,
  });
};

export default IconWrapper;
