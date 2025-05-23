import type { DetailedHTMLProps, ForwardedRef, HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "@acme/ui/lib/utils";

// https://icon-sets.iconify.design/
export type IconProps = DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
> & {
  icon: string;
  srOnly?: string;
};
export const Icon = forwardRef(
  (
    { icon, className, srOnly, ...props }: IconProps,
    ref: ForwardedRef<HTMLSpanElement>,
  ) => {
    return (
      <>
        <span
          ref={ref}
          role="img"
          className={cn(icon, "block size-4", className)}
          {...props}
        ></span>
        {srOnly && <span className="sr-only">{srOnly}</span>}
      </>
    );
  },
);
