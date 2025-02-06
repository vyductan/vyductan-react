import { Link as TanStackLink } from "@tanstack/react-router";

import type { LinkProps as AcmeLinkProps } from "@acme/ui/link";

type LinkProps = AcmeLinkProps;
const Link = ({ href, prefetch, ...props }: LinkProps) => {
  return (
    <TanStackLink
      to={href ?? ""}
      preload={prefetch ? "render" : undefined}
      {...props}
    />
  );
};
export { Link };
