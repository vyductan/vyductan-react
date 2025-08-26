import type { XOR } from "ts-xor";

import type { BadgeProps as ShadcnBadgeProps } from "@acme/ui/shadcn/badge";
import { Badge as ShadcnBadge } from "@acme/ui/shadcn/badge";

import type { BadgeProps } from "./badge";
import { InternalBadge } from "./badge";

type XORBadgeProps = XOR<BadgeProps, ShadcnBadgeProps>;
const Badge = ({ count, ...restProps }: XORBadgeProps) => {
  const isBadgeShadcn = !count;
  if (isBadgeShadcn) return <ShadcnBadge {...restProps} />;

  return <InternalBadge count={count} {...restProps} />;
};

export { Badge };

export { type BadgeProps } from "./badge";
