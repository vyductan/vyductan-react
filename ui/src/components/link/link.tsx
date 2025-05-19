import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";

import { useUiConfig } from "../config-provider/config-provider";

type LinkProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> & {
  prefetch?: boolean;
};
const Link = (props: LinkProps) => {
  const linkConfig = useUiConfig((s) => s.components.link);
  if (linkConfig?.default) {
    return <linkConfig.default {...props} />;
  }
  return <a {...props} />;
};

export type { LinkProps };
export { Link };
