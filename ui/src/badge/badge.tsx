import { cn } from "..";

export type BadgeProps = {
  children?: React.ReactNode;
  count?: React.ReactNode;

  /** Set offset of the badge dot [left, top] */
  offset?: [number, number];
  className?: string;
};
export const Badge = ({ count, children, offset, className }: BadgeProps) => {
  return (
    <span className={cn("relative", className)}>
      {children}
      <span
        className="bg-accent absolute end-0 top-0 size-4 origin-[100%_0%] translate-x-1/2 -translate-y-1/2 rounded-full p-1"
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
