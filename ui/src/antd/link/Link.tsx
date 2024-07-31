import type { Ref } from "react";
import type { LinkProps as RrdLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { Link as ReactRouterLink } from "react-router-dom";

type LinkProps = Omit<RrdLinkProps, "to"> & {
  href: string;
};
const Link = forwardRef(
  ({ href, ...props }: LinkProps, ref: Ref<HTMLAnchorElement>) => {
    return <ReactRouterLink ref={ref} to={href} {...props} />;
  },
);
Link.displayName = "Link";

export { Link };
