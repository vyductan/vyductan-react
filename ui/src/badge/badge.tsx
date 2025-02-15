export type BadgeProps = {
  children: React.ReactNode;
  count?: React.ReactNode;

  /** Set offset of the badge dot [left, top] */
  offset?: [number, number];
};
export const Badge = ({ count, children, offset }: BadgeProps) => {
  return (
    <span className="relative">
      {children}
      <span
        className="absolute end-0 top-0 origin-[100%_0%] -translate-y-1/2 translate-x-1/2"
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
