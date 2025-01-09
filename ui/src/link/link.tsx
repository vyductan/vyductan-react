import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import { forwardRef } from "react";

type LinkProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> & {
  prefetch?: boolean;
};
const Link = forwardRef((props: LinkProps) => {
  return <a {...props} />;
});

export type { LinkProps };
export { Link };
