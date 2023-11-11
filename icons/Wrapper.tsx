import { cloneElement } from "react";
import type { HTMLAttributes, ReactElement } from "react";

import { clsm } from "@vyductan/utils";

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
    className: clsm("h-6 w-6", className),
    "aria-hidden": "true",
    role: "img",
    ...props,
  });
};

export default IconWrapper;
