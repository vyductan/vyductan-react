import type { HTMLAttributes, ReactElement } from "react";
import { cloneElement } from "react";

import { cn } from "../lib/utils";

type IconWrapperProperties = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: ReactElement<any>;
  srOnly?: string;
};
const IconWrapper = ({
  children,
  className,
  srOnly,
  ...properties
}: IconWrapperProperties) => {
  return (
    <>
      <span role="img" className={cn("size-4", className)} {...properties}>
        {cloneElement(children, {
          "aria-hidden": "true",
          style: {
            width: "100%",
            height: "100%",
          },
          ...properties,
        })}
      </span>
      {srOnly && <span className="sr-only">{srOnly}</span>}
    </>
  );
};

export type { IconWrapperProperties as IconWrapperProps };
export { IconWrapper };
