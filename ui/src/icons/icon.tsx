import type { DetailedHTMLProps, HTMLAttributes } from "react";

import { clsm } from "..";

// https://icon-sets.iconify.design/
export type IconProps = DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
> & {
  icon: string;
  srOnly?: string;
};
export const Icon = ({ icon, className, srOnly, ...props }: IconProps) => {
  return (
    <>
      <span className={clsm(icon, className)} {...props}></span>
      {srOnly && <span className="sr-only">{srOnly}</span>}
    </>
  );
};
