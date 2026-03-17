import type { XOR } from "ts-xor";

import { Badge as ShadcnBadge } from "@acme/ui/shadcn/badge";

import type { BadgeProps } from "./badge";
import { InternalBadge } from "./badge";

type ShadcnBadgeProps = React.ComponentProps<typeof ShadcnBadge>;
type XORBadgeProps = XOR<BadgeProps, ShadcnBadgeProps>;
const Badge = (props: XORBadgeProps) => {
  const isBadgeShadcn = !props.count;
  if (isBadgeShadcn) return <ShadcnBadge {...props} />;

  return <InternalBadge count={props.count} {...props} />;
};

export { Badge };

export { type BadgeProps } from "./badge";
