import type { BadgeProps as ShadcnBadgeProps } from "@acme/ui/shadcn/badge";
import { Badge as ShadcnBadge } from "@acme/ui/shadcn/badge";

export type BadgeProps = Pick<ShadcnBadgeProps, "variant" | "className"> & {
  children?: React.ReactNode;
  count?: React.ReactNode;

  /** Set offset of the badge dot [left, top] */
  offset?: [number, number];
};
export const Badge = ({
  count,
  children,
  offset,
  ...restProps
}: BadgeProps) => {
  const isBadgeShadcn = !count;
  if (isBadgeShadcn) return <ShadcnBadge {...restProps} />;

  return (
    <span className="relative">
      {children}
      <span
        className="absolute end-0 top-0 origin-[100%_0%] translate-x-1/2 -translate-y-1/2"
        style={
          offset
            ? {
                marginTop: offset[1],
                right: -offset[0],
              }
            : {}
        }
      >
        {count}
      </span>
    </span>
  );
};
