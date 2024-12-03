import type { LinkProps as NextLinkProps } from "next/link";
import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import { forwardRef } from "react";
import { NavLink } from "react-router";

type LinkProps = NextLinkProps &
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
        to={typeof href === "string" ? href : (href.href ?? "")}
        prefetch={prefetch ? "render" : undefined}
        {...props}
      />
    );
  },
);
export { Link };
