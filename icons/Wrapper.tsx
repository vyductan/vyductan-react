import { cloneElement, HTMLAttributes, ReactElement, ReactNode } from "react";

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
    className: clsm("w-6 h-6", className),
    "aria-hidden": "true",
    role: "img",
    ...props,
  });
};

export default IconWrapper;
