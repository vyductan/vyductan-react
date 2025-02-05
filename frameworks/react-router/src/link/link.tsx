import { NavLink } from "react-router";

import type { LinkProps as AcmeLinkProps } from "@acme/ui/link";

type LinkProps = AcmeLinkProps;
const Link = ({ href, prefetch, ...props }: LinkProps) => {
  return (
    <NavLink
      to={href ?? ""}
      prefetch={prefetch ? "render" : undefined}
      {...props}
    />
  );
};
export { Link };
