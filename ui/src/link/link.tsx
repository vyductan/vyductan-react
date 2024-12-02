import type { LinkProps as NextLinkProps } from "next/link";
import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import { forwardRef } from "react";
import { Link as RrdLink } from "react-router-dom";

type LinkProps = NextLinkProps &
  Omit<
    DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >,
    "href"
  >;
// const X = globalThis.next ? NextLink : RrdLink;
const Link = forwardRef(
  ({ href, ...props }: LinkProps, ref: React.Ref<HTMLAnchorElement>) => {
    return (
      <RrdLink
        ref={ref}
        to={typeof href === "string" ? href : (href.href ?? "")}
        {...props}
      />
    );
  },
);
export { Link };
