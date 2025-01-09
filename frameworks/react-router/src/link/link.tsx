import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import { forwardRef } from "react";
import { NavLink } from "react-router";

import type { LinkProps as AcmeLinkProps } from "@acme/ui/link";

type LinkProps = AcmeLinkProps &
  Omit<
    DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >,
    "href"
  >;
const Link = forwardRef(
  (
    { href, prefetch, ...props }: LinkProps,
    ref: React.Ref<HTMLAnchorElement>,
  ) => {
    return (
      <NavLink
        ref={ref}
        to={href ?? ""}
        prefetch={prefetch ? "render" : undefined}
        {...props}
      />
    );
  },
);
export { Link };
